from flask import Blueprint, request, jsonify
from pymongo import MongoClient
import logging

# Initialize the Blueprint for delivery
delivery_blueprint = Blueprint('delivery', __name__)

# Database setup
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
routes_collection = db.routes

@delivery_blueprint.route('/getAllDeliveries', methods=['GET'])
def get_all_deliveries():
    """
    Fetch all deliveries from the database.
    Returns a list of deliveries with their details.
    """
    try:
        deliveries = list(routes_collection.find({}, {"_id": 0}))
        if not deliveries:
            return jsonify({"message": "No deliveries found"}), 404
        return jsonify({"deliveries": deliveries}), 200
    except Exception as e:
        logging.error(f"Error fetching deliveries: {e}")
        return jsonify({"message": "Error fetching deliveries", "error": str(e)}), 500


@delivery_blueprint.route('/updateDeliveryStatus', methods=['POST'])
def update_delivery_status():
    """
    Update the status of a specific delivery.
    Expects 'vehicleId' and 'status' in the request body.
    """
    try:
        # Retrieve payload data
        data = request.get_json()
        vehicle_id = data.get("vehicleId")
        status = data.get("status")

        # Validate input
        if not vehicle_id or not status:
            return jsonify({"message": "Vehicle ID and status are required"}), 400

        # Update the delivery status in the database
        result = routes_collection.update_one(
            {"vehicle_id": int(vehicle_id), "status": "In Progress"},  # Match only in-progress deliveries
            {"$set": {"status": status}}
        )

        # Check if the update was successful
        if result.modified_count == 1:
            return jsonify({"success": True, "message": f"Delivery status updated to '{status}'"}), 200
        else:
            return jsonify({"success": False, "message": "No matching delivery found to update"}), 404
    except Exception as e:
        logging.error(f"Error updating delivery status: {e}")
        return jsonify({"message": "Error updating delivery status", "error": str(e)}), 500
