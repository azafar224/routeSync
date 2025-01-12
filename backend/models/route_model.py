from pymongo import MongoClient

client = MongoClient("mongodb://127.0.0.1:27017/")
db = client["RouteSync"]
routes_collection = db["routes"]

def save_route(vehicle_id, date, route_sequence):
    """Save optimized route to the database, ensuring no duplication."""
    # Check if the route for this vehicle and date already exists
    existing_route = routes_collection.find_one({"vehicle_id": vehicle_id, "date": date})
    
    if existing_route:
        # If a route already exists, update it instead of creating a duplicate
        routes_collection.update_one(
            {"vehicle_id": vehicle_id, "date": date},
            {"$set": {"route_sequence": route_sequence, "status": "In Progress"}}
        )
    else:
        # Insert a new route if it doesn't exist
        routes_collection.insert_one({
            "vehicle_id": vehicle_id,
            "date": date,
            "route_sequence": route_sequence,
            "status": "In Progress"
        })

def get_routes_by_date(date):
    """Retrieve optimized routes for a specific date."""
    return list(routes_collection.find({"date": date}, {"_id": 0}))
