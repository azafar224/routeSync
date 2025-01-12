from flask import Blueprint, jsonify, send_file
from pymongo import MongoClient
import pandas as pd
import os

download_blueprint = Blueprint('download', __name__)
client = MongoClient("mongodb://localhost:27017/")
db = client.RouteSync

DOWNLOAD_FOLDER = 'downloads'
os.makedirs(DOWNLOAD_FOLDER, exist_ok=True)

@download_blueprint.route('/download/<vehicle_id>', methods=['GET'])
def download_vehicle_route(vehicle_id):
    try:
        query = {} if vehicle_id == "all" else {"vehicle_id": int(vehicle_id)}
        cursor = db.routes.find(query)

        data_list = []
        vehicle_date = None  # To store the vehicle date for the filename

        for document in cursor:
            vehicle_id = document["vehicle_id"]
            route_sequence = document["route_sequence"]
            vehicle_date = document["date"]  # Fetch the date from the document
            for stop_num, route in enumerate(route_sequence, start=1):
                route["Stop Number"] = stop_num
                route["Vehicle"] = vehicle_id
                route["Date"] = document["date"]
                data_list.append(route)

        if not data_list:
            return jsonify({'message': 'No route found for the given vehicle'}), 404

        # Convert to DataFrame
        df = pd.DataFrame(data_list)

        # Generate file name
        if vehicle_id == "all":
            file_name = f"All_Vehicles_Routes({datetime.now().strftime('%Y-%m-%d')}).csv"
        else:
            if not vehicle_date:
                return jsonify({'message': 'No date found for the specified vehicle'}), 404
            formatted_date = vehicle_date.replace("/", "-")  # Format date to avoid invalid characters
            file_name = f"Vehicle_{vehicle_id}({formatted_date}).csv"

        # Save to CSV
        file_path = os.path.join(DOWNLOAD_FOLDER, file_name)
        df.to_csv(file_path, index=False)

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({'message': 'An error occurred while downloading routes', 'error': str(e)}), 500

@download_blueprint.route('/downloadAllWithStatus', methods=['GET'])
def download_all_routes_with_status():
    try:
        deliveries = list(db.routes.find({}, {"_id": 0}))

        if not deliveries:
            return jsonify({'message': 'No deliveries found'}), 404

        # Prepare data for CSV
        data_list = []
        for delivery in deliveries:
            for route in delivery.get("route_sequence", []):
                data_list.append({
                    "Vehicle ID": delivery["vehicle_id"],
                    "Date": delivery["date"],
                    "Status": delivery["status"],
                    "Stop Number": route.get("Stop Number", ""),
                    "Latitude": route.get("Dest Geo Lat", ""),
                    "Longitude": route.get("Dest Geo Lon", ""),
                    "Distributor Name": route.get("Distributor Name", ""),
                })

        # Convert to DataFrame
        df = pd.DataFrame(data_list)

        # Save to CSV
        file_name = f"All_Vehicle_Routes_With_Status.csv"
        file_path = os.path.join(DOWNLOAD_FOLDER, file_name)
        df.to_csv(file_path, index=False)

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({'message': 'An error occurred while downloading all routes with status', 'error': str(e)}), 500
