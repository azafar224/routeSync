from flask import Blueprint, jsonify, request
from pymongo import MongoClient
import logging
from datetime import datetime, timedelta

# Initialize the Blueprint for visualization
visualization_blueprint = Blueprint('visualization', __name__)

# Database setup
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
routes_collection = db.routes

@visualization_blueprint.route('/getCompletionRate', methods=['GET'])
def get_completion_rate():
    """Fetch the completion rate of deliveries for the last 10 days."""
    try:
        # Calculate the date 7 days ago
        ten_days_ago = (datetime.now() - timedelta(days=7)).strftime('%d/%m/%Y')

        pipeline = [
            {"$match": {"date": {"$gte": ten_days_ago}}},  # Filter for last 7 days
            {"$group": {
                "_id": "$date",
                "total_deliveries": {"$sum": 1},
                "completed_deliveries": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Complete"]}, 1, 0]}
                }
            }},
            {"$project": {
                "date": "$_id",
                "completion_rate": {
                    "$cond": {
                        "if": {"$eq": ["$total_deliveries", 0]},
                        "then": 0,
                        "else": {"$multiply": [{"$divide": ["$completed_deliveries", "$total_deliveries"]}, 100]}
                    }
                },
                "_id": 0
            }},
            {"$sort": {"date": -1}}
        ]
        data = list(routes_collection.aggregate(pipeline))
        return jsonify(data), 200
    except Exception as e:
        logging.error(f"Error fetching completion rate: {e}")
        return jsonify({"error": str(e)}), 500


@visualization_blueprint.route('/getDeliveryPoints', methods=['GET'])
def get_delivery_points():
    """Fetch the total number of delivery points for the last 10 days."""
    try:
        ten_days_ago = (datetime.now() - timedelta(days=7)).strftime('%d/%m/%Y')

        pipeline = [
            {"$match": {"date": {"$gte": ten_days_ago}}},  # Filter for last 10 days
            {"$group": {
                "_id": "$date",
                "delivery_points": {"$sum": {"$size": "$route_sequence"}}
            }},
            {"$project": {
                "date": "$_id",
                "delivery_points": 1,
                "_id": 0
            }},
            {"$sort": {"date": 1}}
        ]
        data = list(routes_collection.aggregate(pipeline))
        return jsonify(data), 200
    except Exception as e:
        logging.error(f"Error fetching delivery points: {e}")
        return jsonify({"error": str(e)}), 500


@visualization_blueprint.route('/getDailyDeliveries', methods=['GET'])
def get_daily_deliveries():
    """
    Fetch the count of completed, incomplete, and pending deliveries
    for the last 10 days or a specific date.
    """
    try:
        date = request.args.get('date')  # Date passed in MM/DD/YYYY format
        ten_days_ago = (datetime.now() - timedelta(days=7)).strftime('%d/%m/%Y')

        pipeline = []

        if date:
            try:
                datetime.strptime(date, '%d/%m/%Y')  # Validate the format
                pipeline.append({"$match": {"date": date}})
            except ValueError:
                return jsonify({"error": "Invalid date format. Use MM/DD/YYYY."}), 400
        else:
            # If no specific date, filter for the last 10 days
            pipeline.append({"$match": {"date": {"$gte": ten_days_ago}}})

        pipeline.extend([
            {"$group": {
                "_id": "$date",
                "completed_deliveries": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Complete"]}, 1, 0]}
                },
                "incomplete_deliveries": {
                    "$sum": {"$cond": [{"$eq": ["$status", "Incomplete"]}, 1, 0]}
                },
                "pending_deliveries": {
                    "$sum": {"$cond": [{"$eq": ["$status", "In Progress"]}, 1, 0]}
                }
            }},
            {"$project": {
                "date": "$_id",
                "completed_deliveries": 1,
                "incomplete_deliveries": 1,
                "pending_deliveries": 1,
                "_id": 0
            }},
            {"$sort": {"date": 1}}
        ])

        data = list(routes_collection.aggregate(pipeline))
        return jsonify(data), 200
    except Exception as e:
        logging.error(f"Error fetching daily deliveries: {e}")
        return jsonify({"error": str(e)}), 500