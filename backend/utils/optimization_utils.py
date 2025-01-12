import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
import numpy as np

# Import our GA function from routing_algorithm
from .routing_algorithm import genetic_algorithm

# Define constants for the genetic algorithm
POPULATION_SIZE = 100
NUM_GENERATIONS = 50
MUTATION_RATE = 0.1

# Make sure the MODEL_PATH is correct
MODEL_PATH = r"G:\FYP_Sys\backend\ml_models\vehicle_route_model_best.keras"

# Try loading the RL model
try:
    rl_model = load_model(MODEL_PATH)
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error loading model: {e}")
    rl_model = None  # If loading fails, fallback is None

def optimize_routes(data):
    """
    Main entry point:
      - For each Vehicle ID in the data, extract origin and delivery points.
      - If there's only one delivery point, short-circuit the route.
      - Otherwise, use RL model predictions to seed the GA for final route optimization.
    Returns a dictionary of {vehicle_id: [[lat, lon], ...]}.
    """
    optimized_routes = {}
    vehicles = data["Vehicle Id"].unique()

    for vehicle_id in vehicles:
        vehicle_data = data[data["Vehicle Id"] == vehicle_id]
        vehicle_data = vehicle_data.sort_values(by="dispatch_created_on")

        # Extract origin
        origin_lat = vehicle_data.iloc[0]["Origin Geo Lat"]
        origin_lon = vehicle_data.iloc[0]["Origin Geo Lon"]

        # Extract & clean delivery points (removing duplicates, NaNs)
        delivery_points = vehicle_data[["Dest Geo Lat", "Dest Geo Lon"]].drop_duplicates().values
        delivery_points = [dp for dp in delivery_points if not np.any(np.isnan(dp))]

        # Edge cases
        if len(delivery_points) == 0:
            print(f"No valid delivery points for vehicle {vehicle_id}. Skipping.")
            continue

        if len(delivery_points) == 1:
            # Single-point route: origin -> delivery -> origin
            optimized_routes[int(vehicle_id)] = [
                [origin_lat, origin_lon],
                delivery_points[0].tolist(),
                [origin_lat, origin_lon]
            ]
            print(f"Single delivery point for vehicle {vehicle_id}: {optimized_routes[int(vehicle_id)]}")
            continue

        # Combine origin + deliveries in points_coordinates
        # index 0 => origin, indices 1.. => deliveries
        start_point = np.array([origin_lat, origin_lon])
        points_coordinates = np.vstack((start_point, delivery_points))
        num_points = len(points_coordinates)  # e.g., 8 if 1 origin + 7 deliveries

        # RL model inference (optional)
        rl_prediction_for_ga = None
        if rl_model is not None:
            # The RL model expects up to "feature_dim" columns
            feature_dim = rl_model.input_shape[-1]

            # 1) Pad the coordinate array if needed
            padded_points = np.pad(
                points_coordinates,
                ((0, 0), (0, feature_dim - points_coordinates.shape[1])),
                'constant'
            )
            # 2) Use pad_sequences to get shape (batch_size=1, timesteps=50, features=feature_dim)
            padded_points = pad_sequences([padded_points], maxlen=50, padding='post', dtype='float32')

            # 3) RL inference -> shape e.g. (1, 50, 2) or something similar
            rl_output = rl_model.predict(padded_points)
            print("RL Prediction Shape:", rl_output.shape)
            print("RL Prediction Data:", rl_output)

            # We only have (num_points - 1) deliveries to order
            # So we pick the first (num_points - 1) "scores" from, say, the first dimension of rl_output.
            # Here we take rl_output[0, :num_points-1, 0], which is shape (num_points-1,).
            # This becomes our 1D array of "scores" to seed the GA route.
            if rl_output.shape[1] >= (num_points - 1):
                rl_prediction_for_ga = rl_output[0, : (num_points - 1), 0]
            else:
                # If the model doesn't produce enough steps, fallback to None
                rl_prediction_for_ga = None

        # Run GA for final optimization
        best_route = genetic_algorithm(
            POPULATION_SIZE,
            NUM_GENERATIONS,
            MUTATION_RATE,
            num_points,
            start_point,
            points_coordinates,
            rl_prediction=rl_prediction_for_ga
        )

        # Convert route indices back to actual lat/lon
        # best_route.route are delivery indices [1..num_points-1]
        # We also include the origin at the start and end
        final_coords = []
        # origin first
        final_coords.append(points_coordinates[0].tolist())
        # deliveries in best_route.route order
        for idx in best_route.route:
            final_coords.append(points_coordinates[idx].tolist())
        # plus returning to origin
        final_coords.append(points_coordinates[0].tolist())

        optimized_routes[int(vehicle_id)] = final_coords
        print(f"Optimized route for vehicle {vehicle_id}: {final_coords}")

    return optimized_routes
