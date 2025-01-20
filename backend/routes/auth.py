from flask import Blueprint, request, jsonify, session
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
import logging
import smtplib  # For sending emails
from email.mime.text import MIMEText
import uuid  # For generating reset tokens
from datetime import datetime, timedelta

# Initialize the Blueprint for authentication
auth_blueprint = Blueprint('auth', __name__)

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
users_collection = db.users
reset_tokens_collection = db.reset_tokens

# Initialize bcrypt for password hashing
bcrypt = Bcrypt()

# Constants
RESET_TOKEN_EXPIRY = timedelta(hours=1)  # 1-hour expiration for reset tokens
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
EMAIL_ADDRESS = 'routesync273@gmail.com'
EMAIL_PASSWORD = 'ploc uzxx nave qynz'

def send_email(recipient_email, subject, body):
    """
    Sends an email to the specified recipient.
    """
    try:
        msg = MIMEText(body)
        msg['Subject'] = subject
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = recipient_email

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
            server.sendmail(EMAIL_ADDRESS, recipient_email, msg.as_string())
        logging.info(f"Email sent to {recipient_email}")
    except Exception as e:
        logging.error(f"Failed to send email to {recipient_email}: {e}")
        raise

@auth_blueprint.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    Required fields: name, email, password.
    """
    try:
        data = request.json
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not name or not email or not password:
            return jsonify({'message': 'Name, email, and password are required'}), 400

        # Check if user already exists
        existing_user = users_collection.find_one({"email": email})
        if existing_user:
            return jsonify({'message': 'User already exists'}), 400

        # Hash the password and save the user
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        users_collection.insert_one({
            'name': name,
            'email': email,
            'password': hashed_password,
            'role': 'Administrator'
        })

        return jsonify({'message': 'User registered successfully'}), 201

    except Exception as e:
        logging.error(f"Error during registration: {e}")
        return jsonify({'message': 'An error occurred during registration', 'error': str(e)}), 500


@auth_blueprint.route('/login', methods=['POST'])
def login():
    """
    Login a user.
    Required fields: email, password.
    """
    try:
        data = request.json
        email = data.get('email')
        password = data.get('password')

        # Validate input
        if not email or not password:
            return jsonify({'message': 'Email and password are required'}), 400

        # Check if the user exists
        user = users_collection.find_one({"email": email})
        if not user or not bcrypt.check_password_hash(user['password'], password):
            return jsonify({'message': 'Invalid credentials'}), 401

        # Restrict login to specific roles
        if user['role'] not in ['Logistic Manager', 'Administrator']:
            return jsonify({'message': 'Access denied'}), 403

        # Store user session
        session['user'] = {'name': user['name'], 'email': user['email'], 'role': user['role']}
        return jsonify({'message': 'Login successful', 'user': session['user']}), 200

    except Exception as e:
        logging.error(f"Error during login: {e}")
        return jsonify({'message': 'An error occurred during login', 'error': str(e)}), 500

@auth_blueprint.route('/logout', methods=['POST'])
def logout():
    """
    Logout the current user.
    Clears the session data.
    """
    try:
        session.pop('user', None)
        return jsonify({'message': 'Logout successful'}), 200
    except Exception as e:
        logging.error(f"Error during logout: {e}")
        return jsonify({'message': 'An error occurred during logout', 'error': str(e)}), 500


@auth_blueprint.route('/forgotpassword', methods=['POST'])
def forgot_password():
    try:
        email = request.json.get('email')
        user = users_collection.find_one({'email': email})

        if not user:
            return jsonify({'message': 'User not found.'}), 404

        reset_token = str(uuid.uuid4())
        expiry = datetime.utcnow() + RESET_TOKEN_EXPIRY

        reset_tokens_collection.insert_one({
            'email': email,
            'reset_token': reset_token,
            'expiry': expiry
        })

        reset_link = f"http://localhost:5173/reset-password?token={reset_token}"
        email_subject = "Password Reset Request"
        email_body = f"""
        Hi {user['name']},

        You requested to reset your password. Click the link below to reset it:
        {reset_link}

        If you did not request this, please ignore this email.

        This link will expire in 1 hour.

        Regards,
        RouteSync Team
        """

        send_email(email, email_subject, email_body)
        return jsonify({'message': 'Reset link sent to your email.'}), 200
    except Exception as e:
        logging.error(f"Error during forgot password: {e}")
        return jsonify({'message': 'An error occurred.', 'error': str(e)}), 500


@auth_blueprint.route('/reset-password', methods=['POST'])
def reset_password():
    """
    Handles resetting the password using a valid reset token.
    Required fields: reset_token, new_password.
    """
    try:
        data = request.json
        reset_token = data.get('reset_token')
        new_password = data.get('new_password')

        if not reset_token or not new_password:
            return jsonify({'message': 'Reset token and new password are required'}), 400

        # Find the reset token in the database
        token_data = reset_tokens_collection.find_one({'reset_token': reset_token})
        if not token_data:
            return jsonify({'message': 'Invalid or expired reset token.'}), 400

        # Check if the token is expired
        if datetime.utcnow() > token_data['expiry']:
            reset_tokens_collection.delete_one({'reset_token': reset_token})  # Clean up expired token
            return jsonify({'message': 'Reset token has expired.'}), 400

        # Update the user's password
        hashed_password = bcrypt.generate_password_hash(new_password).decode('utf-8')
        users_collection.update_one({'email': token_data['email']}, {'$set': {'password': hashed_password}})

        # Delete the reset token after successful password reset
        reset_tokens_collection.delete_one({'reset_token': reset_token})

        return jsonify({'message': 'Password has been reset successfully.'}), 200

    except Exception as e:
        logging.error(f"Error during password reset: {e}")
        return jsonify({'message': 'An error occurred.', 'error': str(e)}), 500
