from flask import Flask, request, jsonify, session, send_from_directory
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
import random
import json
import requests
import urllib.parse
from groq_ai import analyze_product_risk, chat_with_groq
from datetime import datetime
from schemas import SignupSchema, ProfileUpdateSchema
from marshmallow import ValidationError
from marshmallow import ValidationError
import logging
import uuid
from concurrent.futures import ThreadPoolExecutor
import time

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Thread Pool
executor = ThreadPoolExecutor(max_workers=2)

from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Calculate paths relative to project root
# current: backend/flask_app/app.py
# root: ../../
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
instance_path = os.path.join(BASE_DIR, 'instance')
os.makedirs(instance_path, exist_ok=True)
DB_PATH = os.path.join(instance_path, 'users.db')

app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev_fallback_secret_key')
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{DB_PATH}'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['SESSION_COOKIE_SECURE'] = True  # Set to True in production with HTTPS
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'  # Allow cross-origin with credentials
app.config['PERMANENT_SESSION_LIFETIME'] = 3600  # 1 hour session lifetime
app.config['SESSION_TYPE'] = 'filesystem'  # Better session storage
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'api_login'

@login_manager.unauthorized_handler
def unauthorized():
    return jsonify({"success": False, "message": "Authentication required"}), 401

os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# User model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    health_conditions = db.Column(db.String(500), default='')
    allergies = db.Column(db.String(500), default='')
    diet_type = db.Column(db.String(100), default='general')
    ingredients_to_avoid = db.Column(db.String(500), default='')

# Scan History model
class ScanHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    product_name = db.Column(db.String(200), nullable=False)
    health_score = db.Column(db.Integer)
    eco_score = db.Column(db.Integer)
    image_filename = db.Column(db.String(200))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    full_analysis = db.Column(db.Text)  # Store full JSON analysis if needed

class Task(db.Model):
    id = db.Column(db.String(36), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    status = db.Column(db.String(20), default='PENDING') # PENDING, PROCESSING, COMPLETED, FAILED
    result = db.Column(db.Text, nullable=True) # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

def process_scan_task(app_instance, task_id, filename, filepath, user_prefs, user_id):
    """Background worker to process the scan."""
    with app_instance.app_context():
        logger.info(f"Starting background task {task_id}")
        task = Task.query.get(task_id)
        if not task:
            logger.error(f"Task {task_id} not found in background worker")
            return
        
        task.status = 'PROCESSING'
        db.session.commit()
        
        try:
            # 1. OCR
            ocr_text = "OCR failed"
            try:
                with open(filepath, 'rb') as f:
                    files = {'file': (filename, f, 'image/jpeg')}
                    logger.info(f"Task {task_id}: Sending to OCR...")
                    response = requests.post('http://localhost:8000/ocr', files=files, timeout=30)
                    if response.status_code == 200:
                        ocr_data = response.json()
                        ocr_text = ocr_data.get('raw_text', '').strip()
                        logger.info(f"Task {task_id}: OCR Success")
                    else:
                        raise Exception(f"OCR API error: {response.status_code}")
            except Exception as e:
                logger.error(f"Task {task_id}: OCR Error: {e}")
                # We continue even if OCR fails, AI might handle empty text or we catch it there
            
            # 2. AI Analysis
            from groq_ai import analyze_product_risk
            logger.info(f"Task {task_id}: Starting AI analysis...")
            ai_analysis = analyze_product_risk(ocr_text, user_prefs)
            
            if "error" in ai_analysis:
                raise Exception(f"AI Analysis failed: {ai_analysis['error']}")

            # 3. Save to History
            health_score = ai_analysis.get('health_score', 50)
            eco_score = ai_analysis.get('eco_score', 50)
            
            # Additional context for Chatbot
            nutritional_benefits = ai_analysis.get('nutritional_benefits', [])
            personalized_notes = ai_analysis.get('personalized_notes', [])
            context = (
                f"Product: {ai_analysis.get('product_name', 'Unknown')}. "
                f"Health Score: {health_score}/100. "
                f"Eco Score: {eco_score}/100. "
                f"Verdict: {ai_analysis.get('verdict', 'unknown')}. "
                f"Benefits: {', '.join(nutritional_benefits)}. "
                f"Warnings: {', '.join(personalized_notes)}. "
                f"User Preferences Applied: {user_prefs['health_conditions']}, {user_prefs['allergies']}."
            )

            new_scan = ScanHistory(
                user_id=user_id,
                product_name=ai_analysis.get('product_name', 'Unknown Product'),
                health_score=health_score,
                eco_score=eco_score,
                image_filename=filename,
                full_analysis=json.dumps(ai_analysis)
            )
            db.session.add(new_scan)
            
            # 4. Update Task
            final_result = {
                "structureData": ai_analysis,
                "healthScore": health_score,
                "ecoScore": eco_score,
                "ecoScoreReasoning": ai_analysis.get('eco_score_reasoning', ''),
                "benefits": nutritional_benefits,
                "notes": personalized_notes,
                "context": context,
                "userPreferences": user_prefs,
                "detectedAllergens": ai_analysis.get('detected_allergens', []),
                "productImage": f"/uploads/{filename}"
            }
            
            task.result = json.dumps(final_result)
            task.status = 'COMPLETED'
            db.session.commit()
            logger.info(f"Task {task_id} completed successfully")
            
        except Exception as e:
            logger.error(f"Task {task_id} failed: {e}", exc_info=True)
            task.status = 'FAILED'
            task.result = str(e)
            db.session.commit()

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def home():
    return jsonify({"message": "EcoScan AI API is running. Visit http://localhost:5173 for the frontend."}), 200

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password, password):
        login_user(user, remember=True)  # Persistent session
        session.permanent = True
        logger.info(f"Login successful for user: {username}")
        return jsonify({"success": True, "message": "Logged in successfully"})
    logger.warning(f"Failed login attempt for user: {username}")
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    try:
        validated_data = SignupSchema().load(data)
    except ValidationError as err:
        return jsonify({"success": False, "message": "Validation error", "errors": err.messages}), 400

    username = validated_data.get('username')
    email = validated_data.get('email')
    password = validated_data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({"success": False, "message": "Username already exists"}), 400
    
    if User.query.filter_by(email=email).first():
        return jsonify({"success": False, "message": "Email already exists"}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
    login_user(new_user, remember=True)
    session.permanent = True
    logger.info(f"Signup successful for user: {username}")
    return jsonify({"success": True, "message": "Account created successfully"})

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"})

@app.route('/api/profile', methods=['GET', 'POST'])
@login_required
def api_profile():
    logger.debug(f"Profile request - User authenticated: {current_user.is_authenticated}, User: {current_user.username if current_user.is_authenticated else 'None'}")
    if request.method == 'GET':
        return jsonify({
            "username": current_user.username,
            "healthConditions": current_user.health_conditions,
            "allergies": current_user.allergies,
            "dietType": current_user.diet_type,
            "ingredientsToAvoid": current_user.ingredients_to_avoid
        })
    elif request.method == 'POST':
        data = request.get_json()
        try:
            validated_data = ProfileUpdateSchema().load(data)
        except ValidationError as err:
            return jsonify({"success": False, "message": "Validation error", "errors": err.messages}), 400
            
        current_user.health_conditions = validated_data.get('healthConditions', '')
        current_user.allergies = validated_data.get('allergies', '')
        current_user.diet_type = validated_data.get('dietType', 'general')
        current_user.ingredients_to_avoid = validated_data.get('ingredientsToAvoid', '')
        db.session.commit()
        logger.info(f"Profile updated for user: {current_user.username}")
        return jsonify({"success": True, "message": "Profile updated"})

@app.route('/api/scan', methods=['POST'])
@login_required
def api_scan():
    logger.info(f"Scan request initiated by user: {current_user.username}")
    
    if 'product_image' not in request.files:
        logger.warning("Scan failed: No image provided in request")
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    file = request.files['product_image']
    if file.filename == '':
        logger.warning("Scan failed: No image selected")
        return jsonify({"success": False, "message": "No image selected"}), 400
    
    try:
        # Save the uploaded file to uploads folder
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{secure_filename(file.filename)}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        logger.info(f"Image saved: {filename}")
        
        # Create Task
        task_id = str(uuid.uuid4())
        new_task = Task(id=task_id, user_id=current_user.id, status='PENDING')
        db.session.add(new_task)
        db.session.commit()
        
        # Get user preferences
        user_prefs = {
            'health_conditions': current_user.health_conditions.lower(),
            'allergies': current_user.allergies.lower(),
            'diet_type': current_user.diet_type.lower(),
            'ingredients_to_avoid': current_user.ingredients_to_avoid.lower()
        }
        
        # Submit to background executor
        # Pass app (for context), IDs, and raw data needed
        # app is the concrete Flask instance here, so we pass it directly
        executor.submit(process_scan_task, app, task_id, filename, filepath, user_prefs, current_user.id)
        
        return jsonify({
            "success": True, 
            "message": "Scan processing started",
            "task_id": task_id
        }), 202

    except Exception as e:
        import traceback
        error_msg = traceback.format_exc()
        logger.error(f"Error initiating scan: {e}")
        
        # Write to file for debugging
        with open("error_log.txt", "w") as f:
            f.write(error_msg)
            
        return jsonify({"success": False, "message": f"Server Error: {str(e)}"}), 500

@app.route('/api/tasks/<task_id>', methods=['GET'])
@login_required
def api_get_task(task_id):
    task = Task.query.filter_by(id=task_id, user_id=current_user.id).first()
    if not task:
        return jsonify({"success": False, "message": "Task not found"}), 404
    
    response = {
        "id": task.id,
        "status": task.status,
        "created_at": task.created_at.isoformat()
    }
    
    if task.status == 'COMPLETED':
        response["result"] = json.loads(task.result)
    elif task.status == 'FAILED':
        response["error"] = task.result
        
    return jsonify({"success": True, "data": response})

@app.route('/api/history', methods=['GET'])
@login_required
def api_history():
    history_items = ScanHistory.query.filter_by(user_id=current_user.id).order_by(ScanHistory.timestamp.desc()).all()
    history_data = []
    
    for item in history_items:
        history_data.append({
            "id": item.id,
            "productName": item.product_name,
            "healthScore": item.health_score,
            "ecoScore": item.eco_score,
            "image": f"/uploads/{item.image_filename}",
            "timestamp": item.timestamp.isoformat(),
            # Parse the full analysis back to JSON if needed, or send specific fields
        })
    
    return jsonify({"success": True, "data": history_data})

@app.route('/api/history/clear', methods=['POST'])
@login_required
def api_history_clear():
    try:
        ScanHistory.query.filter_by(user_id=current_user.id).delete()
        db.session.commit()
        logger.info(f"History cleared for user: {current_user.username}")
        return jsonify({"success": True, "message": "History cleared successfully"})
    except Exception as e:
        logger.error(f"Error clearing history: {e}")
        db.session.rollback()
        return jsonify({"success": False, "message": "Failed to clear history"}), 500

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # secure_filename prevents directory traversal info, so filename is safe to use directly from the URL
    # as long as we serve from the UPLOAD_FOLDER
    from flask import send_from_directory
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/chat', methods=['POST'])
@login_required
def api_chat():
    data = request.get_json()
    user_text = data.get('query', '')
    context = data.get('context', '')

    reply = chat_with_groq(user_text, context)
    return jsonify({"response": reply})

# Create DB tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)