from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import pandas as pd
from utils.optimization_utils import optimize_routes
from pymongo import MongoClient
import os
import logging
from models.route_model import save_route

route_optimization_blueprint = Blueprint('route_optimization', __name__)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync
routes_collection = db.routes

ALLOWED_EXTENSIONS = {'csv'}

# Helper function to check file type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@route_optimization_blueprint.route('/upload', methods=['POST'])
def upload_csv():
    vehicle_id = request.form.get("vehicleId", "all")
    if "file" not in request.files:
        return jsonify({"message": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"message": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        data = pd.read_csv(file_path)

        if "expected_delivery_date" not in data.columns:
            logging.error("Missing 'expected_delivery_date' column in the CSV.")
            return jsonify({"message": "Missing 'expected_delivery_date' column in the uploaded CSV."}), 400

        data["expected_delivery_date"] = data["expected_delivery_date"].fillna("Unknown Date")

        if vehicle_id != "all":
            data = data[data["Vehicle Id"] == int(vehicle_id)]

        optimized_routes = optimize_routes(data)
        final_output = []

        for vehicle, route_coords in optimized_routes.items():
            delivery_date = data[data["Vehicle Id"] == int(vehicle)]["expected_delivery_date"].iloc[0]
            route_sequence = []

            for index, coord in enumerate(route_coords):
                route_sequence.append({
                    "Dest Geo Lat": coord[0],
                    "Dest Geo Lon": coord[1],
                    "Distributor Name": (
                        "Origin/Warehouse" if index == 0 or index == len(route_coords) - 1
                        else next(
                            (
                                row["Distributor Name"]
                                for _, row in data.iterrows()
                                if round(row["Dest Geo Lat"], 6) == round(coord[0], 6)
                                and round(row["Dest Geo Lon"], 6) == round(coord[1], 6)
                            ),
                            "Unknown Distributor"
                        )
                    )
                })

            # Use the save_route function to ensure no duplicates
            save_route(vehicle, delivery_date, route_sequence)
            final_output.append({"Vehicle": vehicle, "Route": route_sequence})

        return jsonify({
            "message": "Routes optimized and saved successfully",
            "routes": final_output
        }), 200

    except Exception as e:
        logging.error(f"Error during route optimization: {e}")
        return jsonify({"message": "An error occurred during route optimization", "error": str(e)}), 500


@route_optimization_blueprint.route('/getRoutedDeliveries', methods=['GET'])
def get_deliveries():
    try:
        # Fetch deliveries from the database
        deliveries = list(routes_collection.find({}, {"_id": 0}))
        return jsonify({"deliveries": deliveries}), 200
    except Exception as e:
        logging.error(f"Error fetching deliveries: {e}")
        return jsonify({"message": "Error fetching deliveries", "error": str(e)}), 500
