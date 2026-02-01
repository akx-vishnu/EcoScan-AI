from app import app, db
import os

print(f"Current working directory: {os.getcwd()}")
print(f"Instance path: {app.instance_path}")
print(f"DB URI: {app.config['SQLALCHEMY_DATABASE_URI']}")

with app.app_context():
    try:
        print("Attempting to create all tables...")
        db.create_all()
        print("Tables created successfully.")
        
        db_file = os.path.join(app.instance_path, 'users.db')
        if os.path.exists(db_file):
             print(f"DB file exists at: {db_file}")
        else:
             # Check if it's in the current dir if not in instance
             if os.path.exists('users.db'):
                 print("DB file exists in current directory users.db")
             else:
                 print("DB file STILL not found after create_all!")
                 
    except Exception as e:
        print(f"Error creating tables: {e}")
        import traceback
        traceback.print_exc()
