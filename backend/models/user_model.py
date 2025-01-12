from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["RouteSync"]
users_collection = db["users"]

def create_user(data):
    """Insert a new user into the database."""
    users_collection.insert_one(data)

def find_user_by_email(email):
    """Find a user by email."""
    return users_collection.find_one({"email": email})
