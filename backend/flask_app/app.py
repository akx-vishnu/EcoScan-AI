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

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)
app.config['SECRET_KEY'] = 'your-secret-key'  # Use a strong, unique key in production
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
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
        print(f"Login successful for user: {username}")
        return jsonify({"success": True, "message": "Logged in successfully"})
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
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
    print(f"Signup successful for user: {username}")
    return jsonify({"success": True, "message": "Account created successfully"})

@app.route('/api/logout', methods=['POST'])
@login_required
def api_logout():
    logout_user()
    return jsonify({"success": True, "message": "Logged out"})

@app.route('/api/profile', methods=['GET', 'POST'])
@login_required
def api_profile():
    print(f"Profile request - User authenticated: {current_user.is_authenticated}, User: {current_user.username if current_user.is_authenticated else 'None'}")
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
        current_user.health_conditions = data.get('healthConditions', '')
        current_user.allergies = data.get('allergies', '')
        current_user.diet_type = data.get('dietType', 'general')
        current_user.ingredients_to_avoid = data.get('ingredientsToAvoid', '')
        db.session.commit()
        print(f"Profile updated for user: {current_user.username}")
        return jsonify({"success": True, "message": "Profile updated"})

@app.route('/api/scan', methods=['POST'])
@login_required
def api_scan():
    print(f"Scan request - User authenticated: {current_user.is_authenticated}, User: {current_user.username if current_user.is_authenticated else 'None'}")
    if 'product_image' not in request.files:
        return jsonify({"success": False, "message": "No image provided"}), 400
    
    file = request.files['product_image']
    if file.filename == '':
        return jsonify({"success": False, "message": "No image selected"}), 400
    
    # Save the uploaded file to uploads folder
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"{timestamp}_{secure_filename(file.filename)}"
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    
    # Send the saved image to OCR API
    ocr_text = "OCR failed: Unable to extract text. Please try again."
    try:
        with open(filepath, 'rb') as f:
            files = {'file': (filename, f, 'image/jpeg')}
            response = requests.post('http://localhost:8000/ocr', files=files, timeout=10)
            if response.status_code == 200:
                data = response.json()
                ocr_text = data.get('raw_text', '').strip()
                print(f"OCR Success: {ocr_text[:100]}...")
            else:
                print(f"OCR API error: {response.status_code} - {response.text}")
    except requests.exceptions.RequestException as e:
        print(f"OCR Request Error: {e}")
    
    # Get user preferences for personalization
    user_prefs = {
        'health_conditions': current_user.health_conditions.lower(),
        'allergies': current_user.allergies.lower(),
        'diet_type': current_user.diet_type.lower(),
        'ingredients_to_avoid': current_user.ingredients_to_avoid.lower()
    }
    print("=== USER PREFS JSON ===")
    print(json.dumps(user_prefs, indent=2))
    print("=======================")

    # Analyze Product Risk using Groq
    from groq_ai import analyze_product_risk # Import here to ensure latest version is used
    ai_analysis = analyze_product_risk(ocr_text, user_prefs)
    print(f"AI Analysis Keys: {list(ai_analysis.keys())}")
    
    # Extracted Data
    structure_data = ai_analysis # The AI now returns the full structure including 'other_info', 'nutritional_facts', etc.
    
    # Normalize keys for the frontend if needed, or pass AI data directly if it matches
    # Ensure mandatory fields exist for the frontend
    
    # Health Score & Eco Score from AI
    health_score = ai_analysis.get('health_score', 50)
    eco_score = ai_analysis.get('eco_score', 50)
    
    # Benefits & Notes
    nutritional_benefits = ai_analysis.get('nutritional_benefits', [])
    personalized_notes = ai_analysis.get('personalized_notes', [])
    
    # Detected Allergens
    detected_allergens = ai_analysis.get('detected_allergens', [])

    # Save to Scan History
    try:
        new_scan = ScanHistory(
            user_id=current_user.id,
            product_name=ai_analysis.get('product_name', 'Unknown Product'),
            health_score=health_score,
            eco_score=eco_score,
            image_filename=filename,
            full_analysis=json.dumps(ai_analysis)
        )
        db.session.add(new_scan)
        db.session.commit()
        print(f"Scan saved to history for user: {current_user.username}")
    except Exception as e:
        print(f"Error saving scan history: {e}")

    # Context for Chatbot
    context = (
        f"Product: {ai_analysis.get('product_name', 'Unknown')}. "
        f"Health Score: {health_score}/100. "
        f"Eco Score: {eco_score}/100 ({ai_analysis.get('eco_score_reasoning', 'No reasoning provided')}). "
        f"Verdict: {ai_analysis.get('verdict', 'unknown')}. "
        f"Benefits: {', '.join(nutritional_benefits)}. "
        f"Warnings: {', '.join(personalized_notes)}. "
        f"User Preferences Applied: {user_prefs['health_conditions']}, {user_prefs['allergies']}."
    )

    return jsonify({
        "success": True,
        "data": {
            "structureData": structure_data,
            "healthScore": health_score,
            "ecoScore": eco_score,
            "ecoScoreReasoning": ai_analysis.get('eco_score_reasoning', ''), # New field
            "benefits": nutritional_benefits,
            "notes": personalized_notes,
            "context": context,
            "userPreferences": user_prefs,
            "detectedAllergens": detected_allergens,
            "userPreferences": user_prefs,
            "detectedAllergens": detected_allergens,
            "productImage": f"/uploads/{filename}"
        }
    })

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
        print(f"History cleared for user: {current_user.username}")
        return jsonify({"success": True, "message": "History cleared successfully"})
    except Exception as e:
        print(f"Error clearing history: {e}")
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