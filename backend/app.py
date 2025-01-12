from flask import Flask
from flask_cors import CORS
from flask_session import Session
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from datetime import timedelta
import os
import logging

from routes.auth import auth_blueprint
from routes.role_management import role_blueprint
from routes.route_optimization import route_optimization_blueprint
from routes.download import download_blueprint
from routes.delivery import delivery_blueprint
from routes.visualization import visualization_blueprint

app = Flask(__name__)
CORS(app, supports_credentials=True)
bcrypt = Bcrypt(app)

# Configure the session
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
Session(app)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
users_collection = db.users
routes_collection = db.routes

# Folders
UPLOAD_FOLDER = 'uploads'
DOWNLOAD_FOLDER = 'downloads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

# Logging
logging.basicConfig(level=logging.DEBUG)

# Initialize default admin user
def initialize_admin():
    admin_email = "admin@routesync.com"
    admin_password = "admin123"
    admin_exists = users_collection.find_one({"email": admin_email})
    if not admin_exists:
        hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
        users_collection.insert_one({
            'name': 'Default Administrator',
            'email': admin_email,
            'password': hashed_password,
            'role': 'Administrator'
        })
        logging.info(f"Administrator created: {admin_email}")
    else:
        logging.info(f"Administrator already exists: {admin_email}")

initialize_admin()

# Register Blueprints
app.register_blueprint(auth_blueprint, url_prefix='/auth')
app.register_blueprint(role_blueprint, url_prefix='/role_management')
app.register_blueprint(route_optimization_blueprint, url_prefix='/route_optimization')
app.register_blueprint(download_blueprint, url_prefix='/download')
app.register_blueprint(delivery_blueprint, url_prefix='/delivery')
app.register_blueprint(visualization_blueprint, url_prefix='/visualization')

if __name__ == '__main__':
    app.run(port=3001, debug=True)
