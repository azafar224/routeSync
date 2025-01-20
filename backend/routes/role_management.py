from flask import Blueprint, request, jsonify, session
from pymongo import MongoClient
import logging

# Initialize the Blueprint for role management
role_blueprint = Blueprint('role_management', __name__)

# Database setup
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
users_collection = db.users

@role_blueprint.route('/grantRole', methods=['POST'])
def grant_role():
    if 'user' not in session:
        return jsonify({'message': 'Access denied. You must be logged in to perform this action.'}), 403

    if session['user']['role'] != 'Administrator':
        return jsonify({'message': 'Access denied. Only administrators can grant roles.'}), 403

    data = request.json
    email = data.get('email')
    new_role = data.get('role')

    if not email or not new_role:
        return jsonify({'message': 'Invalid request. Email and role are required.'}), 400

    if new_role not in ["Administrator", "Logistic Manager", "User"]:
        return jsonify({'message': 'Invalid role specified.'}), 400

    result = users_collection.update_one({'email': email}, {'$set': {'role': new_role}})
    if result.modified_count == 0:
        return jsonify({'message': 'User not found or role unchanged.'}), 404

    return jsonify({'message': f'Role updated to {new_role} for {email}'}), 200

@role_blueprint.route('/users', methods=['GET'])
def get_users():
    if 'user' not in session:
        return jsonify({'message': 'Access denied. You must be logged in to perform this action.'}), 403

    if session['user']['role'] != 'Administrator':
        return jsonify({'message': 'Access denied. Only administrators can view users.'}), 403

    users = list(users_collection.find({}, {'_id': 0, 'password': 0}))
    return jsonify({'users': users}), 200

@role_blueprint.route('/currentUser', methods=['GET'])
def get_current_user():
    """Fetches details of the currently logged-in user."""
    if 'user' not in session:
        return jsonify({'message': 'No user is logged in.'}), 401

    return jsonify({'user': session['user']}), 200
