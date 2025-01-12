import React, { useState, useEffect } from "react";
import { FaTruck } from "react-icons/fa";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import axios from "axios";

const TrackDeliveries = () => {
  const isOpen = true;
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");

  // Fetch all deliveries from the backend
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await axios.get(
          "http://127.0.0.1:3001/delivery/getAllDeliveries"
        ); // Fetch all deliveries
        const allDeliveries = response.data.deliveries || [];
        setDeliveries(allDeliveries);

        // Extract unique dates from deliveries
        const dates = [...new Set(allDeliveries.map((d) => d.date))];
        setAvailableDates(dates);
        setFilteredDeliveries(allDeliveries);
      } catch (error) {
        console.error("Error fetching deliveries:", error);
      }
    };

    fetchDeliveries();
  }, []);

  // Update delivery status (Complete or Incomplete)
  const updateDeliveryStatus = async (vehicleId, status) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3001/delivery/updateDeliveryStatus",
        { vehicleId, status },
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success) {
        alert(
          `Delivery status updated to '${status}' for vehicle ${vehicleId}`
        );
        setDeliveries((prev) =>
          prev.map((delivery) =>
            delivery.vehicle_id === vehicleId
              ? { ...delivery, status }
              : delivery
          )
        );
        setFilteredDeliveries((prev) =>
          prev.map((delivery) =>
            delivery.vehicle_id === vehicleId
              ? { ...delivery, status }
              : delivery
          )
        );
      } else {
        alert("Failed to update delivery status.");
      }
    } catch (error) {
      console.error(`Error updating delivery status to ${status}:`, error);
      alert(`An error occurred while updating delivery status to ${status}.`);
    }
  };

  // Filter deliveries by selected date
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (!date) {
      setFilteredDeliveries(deliveries); // Reset to all deliveries if no date is selected
    } else {
      const filtered = deliveries.filter((delivery) => delivery.date === date);
      setFilteredDeliveries(filtered);
    }
  };

  // Download all routes with their status
  const handleDownloadAllWithStatus = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:3001/download/downloadAllWithStatus",
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `All_Vehicle_Routes_With_Status_${
          new Date().toISOString().split("T")[0]
        }.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading all routes with status:", error);
      alert(
        "An error occurred while downloading all vehicle routes with status."
      );
    }
  };

  return (
    <div className="container-fluid">
      <Sidebar isOpen={isOpen} activeScreen="trackDrivers" />
      <main className="main-content">
        <Header />
        <div className="content">
          <div className="filter-container">
            <label htmlFor="date-filter">Filter by Date:</label>
            <select
              id="date-filter"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="form-select"
            >
              <option value="">All Dates</option>
              {availableDates.map((date, index) => (
                <option key={index} value={date}>
                  {date}
                </option>
              ))}
            </select>
          </div>
          <div className="button-container">
            <button
              className="btn btn-primary download-all-btn"
              onClick={handleDownloadAllWithStatus}
            >
              Download All Routes with Status
            </button>
          </div>
          <div className="track-drivers-content">
            {filteredDeliveries.length > 0 ? (
              filteredDeliveries.map((delivery, index) => (
                <div key={index} className="delivery-card">
                  <div className="card-header">
                    <div>
                      <div className="vehicle-number">
                        <FaTruck className="vehicle-icon" />
                        Vehicle: {delivery.vehicle_id}
                      </div>
                      <div className="delivery-date">
                        Date: {delivery.date || "Unknown Date"}
                      </div>
                    </div>
                    <div
                      className={`status ${delivery.status
                        ?.trim()
                        .toLowerCase()
                        .replace(" ", "-")}`}
                    >
                      {delivery.status}
                    </div>
                  </div>
                  <div className="stops">
                    <h5>Stops</h5>
                    <div className="stops-list">
                      {delivery.route_sequence &&
                        delivery.route_sequence.map((stop, idx) => {
                          // Label first and last stop as "Origin/Warehouse"
                          if (idx === 0) {
                            return (
                              <div key={idx} className="stop-item">
                                <span>Origin/Warehouse</span>
                                <br />
                                <span>
                                  Latitude: {stop["Dest Geo Lat"]}, Longitude:{" "}
                                  {stop["Dest Geo Lon"]}
                                </span>
                              </div>
                            );
                          }
                          if (idx === delivery.route_sequence.length - 1) {
                            return (
                              <div key={idx} className="stop-item">
                                <span>Origin/Warehouse</span>
                                <br />
                                <span>
                                  Latitude: {stop["Dest Geo Lat"]}, Longitude:{" "}
                                  {stop["Dest Geo Lon"]}
                                </span>
                              </div>
                            );
                          }
                          // Regular stops with numbering starting from 1 after the origin
                          return (
                            <div key={idx} className="stop-item">
                              <span>
                                {idx}. Delivery Point:{" "}
                                {stop["Distributor Name"]}
                              </span>
                              <br />
                              <span>
                                Latitude: {stop["Dest Geo Lat"]}, Longitude:{" "}
                                {stop["Dest Geo Lon"]}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                  <div className="button-container">
                    {delivery.status === "In Progress" && (
                      <>
                        <button
                          className="status-btn complete"
                          onClick={() =>
                            updateDeliveryStatus(
                              delivery.vehicle_id,
                              "Complete"
                            )
                          }
                        >
                          Mark Complete
                        </button>
                        <button
                          className="status-btn incomplete"
                          onClick={() =>
                            updateDeliveryStatus(
                              delivery.vehicle_id,
                              "Incomplete"
                            )
                          }
                        >
                          Mark Incomplete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-deliveries">
                No deliveries found for the selected date.
              </div>
            )}
          </div>
        </div>
      </main>
      <style jsx>{`
        .container-fluid {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .main-content {
          margin-left: ${isOpen ? "240px" : "80px"};
          margin-top: 60px;
          padding: 20px 20px 20px; /* Push content below header */
          background-color: #f8f9fa;
          flex-grow: 1;
          overflow-y: auto;
        }

        .content {
          padding-top: 20px;
        }

        .filter-container {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-container label {
          font-size: 16px;
          font-weight: bold;
        }

        .form-select {
          padding: 8px;
          border: 1px solid #ccc;
          border-radius: 5px;
          font-size: 14px;
        }

        .track-drivers-content {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          justify-content: center;
        }

        .delivery-card {
          background: white;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          padding: 20px;
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }

        .vehicle-number {
          font-size: 16px;
          font-weight: bold;
        }

        .vehicle-icon {
          margin-right: 5px;
        }

        .delivery-date {
          font-size: 14px;
          color: #6c757d;
        }

        .status {
          font-size: 14px;
          font-weight: bold;
          text-transform: capitalize;
          border-radius: 5px;
          padding: 5px 10px;
        }

        .status.in-progress {
          color: white;
          background-color: #ffc107;
        }

        .status.complete {
          color: white;
          background-color: #28a745;
        }

        .status.incomplete {
          color: white;
          background-color: #dc3545;
        }

        .stops {
          margin: 10px 0;
        }

        .stops h5 {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
        }

        .stops-list {
          max-height: 200px;
          overflow-y: auto;
          padding-right: 10px;
        }

        .stop-item {
          background: #f8f9fa;
          padding: 8px;
          border-radius: 5px;
          margin-bottom: 5px;
        }

        .button-container {
          text-align: center;
          margin-top: auto;
          display: flex;
          justify-content: space-between;
        }

        .status-btn {
          border: none;
          border-radius: 5px;
          padding: 5px 15px;
          font-size: 14px;
          cursor: pointer;
          color: white;
          width: 48%;
        }

        .status-btn.complete {
          background-color: #28a745;
        }

        .status-btn.complete:hover {
          background-color: #218838;
        }

        .status-btn.incomplete {
          background-color: #dc3545;
        }

        .status-btn.incomplete:hover {
          background-color: #c82333;
        }

        .no-deliveries {
          font-size: 18px;
          color: #6c757d;
          margin-top: 20px;
        }

        .button-container {
          text-align: center;
          margin-bottom: 20px;
        }

        .btn-primary.download-all-btn {
          padding: 10px 20px;
          border-radius: 5px;
          background-color: #f15b5b;
          color: white;
          border: none;
          cursor: pointer;
          margin: auto;
        }

        .btn-primary.download-all-btn:hover {
          background-color: #0056b3;
        }
      `}</style>
    </div>
  );
};

export default TrackDeliveries;
