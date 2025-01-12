import numpy as np
import random

def calculate_distance(point1, point2):
    """
    Calculate Euclidean distance between two 2D points.
    """
    return np.linalg.norm(point1 - point2)

class Route:
    """
    Represents a specific route (permutation of delivery points) plus its distance.
    The route array does NOT include index 0 (the origin), which is handled separately.
    """
    def __init__(self, route, start_point, points_coordinates):
        """
        :param route: 1D array of indices in [1..(num_points-1)], referencing the deliveries
        :param start_point: np.array([lat, lon]) - same as points_coordinates[0], the origin
        :param points_coordinates: array of shape (num_points, 2) with row 0 as the origin
        """
        self.route = route
        self.start_point = start_point
        self.points_coordinates = points_coordinates
        self.distance = self.calculate_distance()

    def calculate_distance(self):
        """
        Calculates total distance from origin -> first delivery -> ...
        -> last delivery -> back to origin.
        """
        total_distance = 0
        # Start point to the first delivery
        first_delivery_idx = self.route[0]
        total_distance += calculate_distance(self.start_point, self.points_coordinates[first_delivery_idx])

        # Delivery to next delivery
        for i in range(len(self.route) - 1):
            curr_idx = self.route[i]
            next_idx = self.route[i + 1]
            total_distance += calculate_distance(
                self.points_coordinates[curr_idx],
                self.points_coordinates[next_idx]
            )

        # Last delivery to origin
        last_delivery_idx = self.route[-1]
        total_distance += calculate_distance(self.points_coordinates[last_delivery_idx], self.start_point)
        return total_distance

def generate_initial_population(
    population_size, num_points, start_point, points_coordinates, rl_prediction=None
):
    """
    Create initial population of routes.
      - Each route is a permutation of [1, 2, ..., num_points-1] 
        (index 0 is the origin, so skip it).
      - If rl_prediction is provided, we use it to seed one route.
    """
    population = []

    # If RL gave us a 1D array of length (num_points - 1),
    # we interpret it as "scores" for each of the [1..(num_points-1)] deliveries.
    if rl_prediction is not None:
        # Sort the RL scores (ascending). The RL array corresponds to deliveries only.
        # Then shift the sorted indices by +1 to map them onto [1..(num_points-1)].
        # Example: if rl_prediction.shape -> (num_points-1,) then:
        sorted_indices = np.argsort(rl_prediction)  # shape: (num_points-1,)
        # Map each index i -> i+1 to reference points_coordinates
        rl_route = sorted_indices + 1
        population.append(Route(rl_route, start_point, points_coordinates))
        population_size -= 1

    # Fill the rest of the population randomly
    for _ in range(population_size):
        # Permutation of [1..(num_points-1)]
        route = np.random.permutation(range(1, num_points))
        population.append(Route(route, start_point, points_coordinates))

    return population

def crossover(parent1, parent2, num_points, start_point, points_coordinates):
    """
    Single-cut crossover:
      1) Take a random crossover point
      2) Child's first segment is parent's route up to crossover point
      3) Fill the remainder with parent's route while preserving order and no duplicates
    """
    route_length = num_points - 1  # deliveries only
    crossover_point = random.randint(0, route_length - 1)
    child = np.zeros(route_length, dtype=int)

    # Copy from parent1 up to crossover_point
    child[:crossover_point] = parent1.route[:crossover_point]

    # Fill child with remaining genes from parent2
    idx = crossover_point
    for gene in parent2.route:
        if gene not in child:
            child[idx] = gene
            idx += 1

    return Route(child, start_point, points_coordinates)

def mutate(route, mutation_rate):
    """
    With probability mutation_rate, randomly swap two positions in the route.
    """
    if np.random.random() < mutation_rate:
        route_length = len(route.route)
        idx1, idx2 = random.sample(range(route_length), 2)
        # Swap the deliveries at idx1 and idx2
        route.route[idx1], route.route[idx2] = route.route[idx2], route.route[idx1]
    return route

def genetic_algorithm(
    population_size, num_generations, mutation_rate,
    num_points, start_point, points_coordinates, rl_prediction=None
):
    """
    Main GA loop:
      1) Generate initial population (seeded with RL if present).
      2) For each generation:
         a) Sort population by distance.
         b) Select top half for mating.
         c) Crossover and mutate to produce offspring.
         d) Combine offspring + old population, sort, and truncate.
      3) Return best route (lowest distance).
    """
    # Generate initial population
    population = generate_initial_population(
        population_size, num_points, start_point, points_coordinates, rl_prediction
    )

    for _ in range(num_generations):
        # Sort by distance ascending
        population.sort(key=lambda x: x.distance)

        # Select top half for breeding
        offspring = []
        half_pop = population_size // 2
        for __ in range(half_pop):
            parent1, parent2 = random.sample(population[:half_pop], 2)
            # Crossover
            child1 = crossover(parent1, parent2, num_points, start_point, points_coordinates)
            child2 = crossover(parent2, parent1, num_points, start_point, points_coordinates)
            # Mutate
            offspring.append(mutate(child1, mutation_rate))
            offspring.append(mutate(child2, mutation_rate))

        # Combine, sort, and truncate
        population.extend(offspring)
        population.sort(key=lambda x: x.distance)
        population = population[:population_size]

    best_route = population[0]
    # No need to append best_route.route[0] – we handle return-to-origin already in distance calculations
    best_route.distance = best_route.calculate_distance()

    return best_route
