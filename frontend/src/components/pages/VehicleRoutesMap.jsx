import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  ZoomControl,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

const VehicleRoutesMap = () => {
  const [routes, setRoutes] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3001/delivery/getAllDeliveries"
        );
        const deliveries = response.data.deliveries || [];
        setRoutes(deliveries);

        // Extract unique dates and vehicles
        const uniqueDates = [...new Set(deliveries.map((route) => route.date))];
        setAvailableDates(uniqueDates);

        const uniqueVehicles = [
          ...new Set(deliveries.map((route) => route.vehicle_id)),
        ];
        setVehicles(
          uniqueVehicles.map((vehicle) => ({
            value: vehicle,
            label: `Vehicle ${vehicle}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchRoutes();
  }, []);

  const filteredRoutes = routes.filter((route) => {
    const matchesStatus = selectedStatus
      ? route.status === selectedStatus
      : true;
    const matchesDate = selectedDate ? route.date === selectedDate : true;
    const matchesVehicle = selectedVehicle
      ? route.vehicle_id === parseInt(selectedVehicle)
      : true;

    return matchesStatus && matchesDate && matchesVehicle;
  });

  const CustomZoomButtons = () => {
    const map = useMap();

    return (
      <div className="zoom-buttons">
        <button onClick={() => map.setZoom(map.getZoom() + 1)}>Zoom In</button>
        <button onClick={() => map.setZoom(map.getZoom() - 1)}>Zoom Out</button>
      </div>
    );
  };

  const renderMap = () => {
    const positions = filteredRoutes.flatMap((route) =>
      route.route_sequence.map((point) => [
        parseFloat(point["Dest Geo Lat"]),
        parseFloat(point["Dest Geo Lon"]),
      ])
    );

    return (
      <MapContainer
        key={JSON.stringify(filteredRoutes)} // Force re-render map when routes change
        center={positions[0] || [31.337319, 73.057297]} // Default center
        zoom={12}
        zoomControl={false} // Disable default zoom controls
        style={{ height: "600px", width: "100%", borderRadius: "10px" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ZoomControl position="bottomright" />
        <CustomZoomButtons /> {/* Custom zoom buttons inside MapContainer */}
        {filteredRoutes.map((route, index) => (
          <Polyline
            key={index}
            positions={route.route_sequence.map((point) => [
              parseFloat(point["Dest Geo Lat"]),
              parseFloat(point["Dest Geo Lon"]),
            ])}
            color={
              route.status === "Complete"
                ? "green"
                : route.status === "In Progress"
                ? "blue"
                : "red"
            }
          />
        ))}
        {filteredRoutes.map((route) =>
          route.route_sequence.map((point, index) => (
            <Marker
              key={`${route.vehicle_id}-${index}`}
              position={[
                parseFloat(point["Dest Geo Lat"]),
                parseFloat(point["Dest Geo Lon"]),
              ]}
            >
              <Popup>
                {index === 0 || index === route.route_sequence.length - 1
                  ? `Warehouse/Origin`
                  : `Stop: ${index} Delivery Location: ${point["Distributor Name"]}`}
              </Popup>
            </Marker>
          ))
        )}
      </MapContainer>
    );
  };

  return (
    <div className="container-fluid">
      <Sidebar isOpen={true} activeScreen="routeDisplay" />
      <main className="main-content">
        <Header />
        <div className="filters">
          <div className="filter-select">
            <label htmlFor="status-filter">Filter by Status:</label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value="Complete">Completed</option>
              <option value="In Progress">Pending</option>
              <option value="Incomplete">Incomplete</option>
            </select>
          </div>

          <div className="filter-select">
            <label htmlFor="date-filter">Filter by Date:</label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="">Select Date</option>
              {availableDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-select">
            <label htmlFor="vehicle-filter">Filter by Vehicle:</label>
            <select
              id="vehicle-filter"
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.value} value={vehicle.value}>
                  {vehicle.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="map-container">{renderMap()}</div>
      </main>
      <style jsx>{`
        .container-fluid {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background: linear-gradient(115deg, #3d00a6, #0c0014);
        }

        .main-content {
          margin-left: 230px;
          background: linear-gradient(115deg, #3d00a6, #0c0014);
          padding: 20px;
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          overflow-y: auto;
        }

        .filters {
          display: flex;
          justify-content: space-between;
          width: 100%;
          max-width: 800px;
          margin-bottom: 20px;
          position: relative;
          z-index: 1000;
        }

        .filter-select {
          width: 30%;
        }

        .filter-select label {
          color: #e8f9ff;
          display: block;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        select {
          width: 100%;
          padding: 8px;
          font-size: 14px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #fff;
        }

        .map-container {
          height: 500px;
          width: 80%;
          border-radius: 10px;
          overflow: hidden;
          margin-top: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1;
        }

        .zoom-buttons {
          position: absolute;
          bottom: 40px;
          right: 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .zoom-buttons button {
          background-color: #6c5ce7;
          color: white;
          border: none;
          padding: 8px 15px;
          font-size: 14px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.3s ease;
        }

        .zoom-buttons button:hover {
          background-color: #4a3fb2;
        }
      `}</style>
    </div>
  );
};

export default VehicleRoutesMap;
