import React, { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Select from "react-select";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

const RouteOptimization = () => {
  const [file, setFile] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Handle file drop using react-dropzone
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ".csv",
    maxFiles: 1,
  });

  const handleGenerateRoutes = async () => {
    if (!file) {
      alert("Please upload a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://127.0.0.1:3001/route_optimization/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Routes generated successfully!");
      fetchVehicles();
    } catch (error) {
      console.error("Error generating routes:", error);
      alert("Error generating routes.");
    }
  };

  const fetchVehicles = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3001/route_optimization/getRoutedDeliveries"
      );
      const inProgressVehicles = response.data.deliveries.filter(
        (delivery) => delivery.status === "In Progress"
      );
      const vehicleOptions = inProgressVehicles.map((vehicle) => ({
        value: vehicle.vehicle_id,
        label: `Vehicle ${vehicle.vehicle_id}`,
      }));
      setVehicles(vehicleOptions);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    }
  };

  const handleDisplayMap = async () => {
    if (!selectedVehicle) {
      alert("Please select a vehicle first.");
      return;
    }

    try {
      const response = await axios.get(
        `http://127.0.0.1:3001/route_optimization/getRoutedDeliveries`
      );
      const selectedRoute = response.data.deliveries.find(
        (route) => route.vehicle_id === selectedVehicle.value
      );
      if (selectedRoute) {
        setRoutes(selectedRoute.route_sequence);
        setShowMap(true);
      } else {
        alert("No route found for the selected vehicle.");
      }
    } catch (error) {
      console.error("Error fetching route:", error);
      alert("Error fetching route for the map.");
    }
  };

  const handleDownloadRoutes = async (
    vehicleId = "all",
    withStatus = false
  ) => {
    try {
      const endpoint = withStatus
        ? "http://127.0.0.1:3001/download/downloadAllWithStatus"
        : `http://127.0.0.1:3001/download/download/${vehicleId}`;
      const response = await axios.get(endpoint, { responseType: "blob" });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");

      const deliveryDate =
        vehicleId === "all"
          ? new Date().toISOString().split("T")[0]
          : vehicles.find((v) => v.value === vehicleId)?.label;

      link.href = url;
      link.setAttribute(
        "download",
        withStatus
          ? `All_Vehicle_Routes_With_Status(${deliveryDate}).csv`
          : vehicleId === "all"
          ? `All_Vehicle_Routes(${deliveryDate}).csv`
          : `Vehicle_${vehicleId}(${deliveryDate}).csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading routes:", error);
      alert("Error downloading routes.");
    }
  };

  const renderMap = () => {
    if (!routes || routes.length === 0) {
      return <p>No route to display for the selected vehicle.</p>;
    }

    const positions = routes.map((point) => [
      parseFloat(point["Dest Geo Lat"]),
      parseFloat(point["Dest Geo Lon"]),
    ]);

    return (
      <MapContainer
        center={positions[0]}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Polyline positions={positions} color="blue" />
        {routes.map((point, index) => (
          <Marker
            key={index}
            position={[
              parseFloat(point["Dest Geo Lat"]),
              parseFloat(point["Dest Geo Lon"]),
            ]}
          >
            <Popup>
              {index === 0 || index === routes.length - 1
                ? `Warehouse/Origin`
                : `Stop: ${index} Delivery Location: ${point["Distributor Name"]}`}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    );
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <div className="container-fluid">
      <Sidebar isOpen={true} activeScreen="routeOptimization" />
      <main className="main-content">
        <Header />
        <div className="route-optimization-content">
          <div className="upload-container" {...getRootProps()}>
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here...</p>
            ) : (
              <p>
                Drag & drop a CSV file here, or <span>click to select one</span>
              </p>
            )}
            {file && <p className="file-name">Selected File: {file.name}</p>}
          </div>
          <button
            onClick={handleGenerateRoutes}
            className="btn btn-primary mt-3"
          >
            Generate Routes
          </button>
          <Select
            className="mt-3 dropdown"
            options={vehicles}
            value={selectedVehicle}
            onChange={setSelectedVehicle}
            placeholder="Select a Vehicle"
            isSearchable
          />
          <div className="button-group mt-3">
            <button onClick={handleDisplayMap} className="btn btn-info">
              Display Map
            </button>
            <button
              onClick={() =>
                handleDownloadRoutes(
                  selectedVehicle ? selectedVehicle.value : "all"
                )
              }
              className="btn btn-secondary"
            >
              Download Selected Vehicle Routes
            </button>
            <button
              onClick={() => handleDownloadRoutes("all")}
              className="btn btn-success"
            >
              Download All Routes
            </button>
            <button
              onClick={() => handleDownloadRoutes("all", true)}
              className="btn btn-warning"
            >
              Download All Routes with Status
            </button>
          </div>
          <div className="map-container mt-4">{showMap && renderMap()}</div>
        </div>
      </main>
      <style>{`
        .container-fluid {
          display: flex;
          height: 100vh;
          overflow: hidden;
          background-color: #f8f9fa;
        }
        .main-content {
          margin-left: 230px;
          background-color: #f8f9fa;
          padding: 20px;
          margin-top: 60px;
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 90%;
          overflow-y: auto;
        }
        .route-optimization-content {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .upload-container {
          width: 100%;
          max-width: 400px;
          padding: 20px;
          border: 2px dashed #213555;
          border-radius: 10px;
          text-align: center;
          background-color: #f8f9fa;
          transition: background-color 0.3s ease;
        }
        .upload-container:hover {
          background-color: #e9ecef;
        }
        .upload-container p {
          margin: 0;
          color: #f15b5b;
          font-weight: bold;
        }
        .upload-container span {
          color: #213555;
          text-decoration: underline;
          cursor: pointer;
        }
        .file-name {
          margin-top: 10px;
          font-size: 14px;
          color: #6c757d;
        }
        .button-group {
          display: flex;
          justify-content: center;
          gap: 15px;
          width: 100%;
        }
        .dropdown {
          width: 100%;
          max-width: 400px;
          z-index:2;
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
        .btn {
          flex: 1;
          max-width: 200px;
          border-radius: 20px;
          padding: 10px 20px;
          background-color: #f15b5b;
          color: #FFFFFF;
          transition: background-color 0.3s ease;
          text-align: center;
        }
        .btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default RouteOptimization;
