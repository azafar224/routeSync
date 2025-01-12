import React, { useEffect, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, registerables } from "chart.js";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";

ChartJS.register(...registerables);

const Home = () => {
  const isOpen = true;
  const [completionRateData, setCompletionRateData] = useState([]);
  const [deliveryPointsData, setDeliveryPointsData] = useState([]);
  const [dailyDeliveriesData, setDailyDeliveriesData] = useState([]);
  const [overallStatusData, setOverallStatusData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const completionRateResponse = await fetch(
          "http://127.0.0.1:3001/visualization/getCompletionRate"
        );
        const completionRate = await completionRateResponse.json();
        setCompletionRateData(completionRate || []);

        const deliveryPointsResponse = await fetch(
          "http://127.0.0.1:3001/visualization/getDeliveryPoints"
        );
        const deliveryPoints = await deliveryPointsResponse.json();
        setDeliveryPointsData(deliveryPoints || []);

        const dailyDeliveriesResponse = await fetch(
          `http://127.0.0.1:3001/visualization/getDailyDeliveries?date=${
            selectedDate || ""
          }`
        );
        const dailyDeliveries = await dailyDeliveriesResponse.json();
        setDailyDeliveriesData(dailyDeliveries || []);

        const overallStatusResponse = await fetch(
          "http://127.0.0.1:3001/visualization/getDailyDeliveries"
        );
        const overallStatus = await overallStatusResponse.json();

        // Aggregate status counts
        const completed = overallStatus.reduce(
          (acc, cur) => acc + (cur.completed_deliveries || 0),
          0
        );
        const incomplete = overallStatus.reduce(
          (acc, cur) => acc + (cur.incomplete_deliveries || 0),
          0
        );
        const pending = overallStatus.reduce(
          (acc, cur) => acc + (cur.pending_deliveries || 0),
          0
        );

        setOverallStatusData({
          completed,
          incomplete,
          pending,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const inputDate = e.target.value; // Input date in YYYY-MM-DD
    const [year, month, day] = inputDate.split("-");
    const formattedDate = `${month}/${day}/${year}`; // Convert to MM/DD/YYYY
    setSelectedDate(formattedDate);
  };

  const systemColors = {
    primary: "#003C43",
    success: "#4CAF50",
    danger: "#F15B5B",
    warning: "#FFC107",
    background: "#F8F9FA",
  };

  const completionRateChartData = {
    labels: completionRateData.map((d) => d.date),
    datasets: [
      {
        label: "Completion Rate",
        data: completionRateData.map((d) => d.completion_rate),
        backgroundColor: systemColors.success,
        borderColor: systemColors.primary,
        borderWidth: 1,
      },
    ],
  };

  const deliveryPointsChartData = {
    labels: deliveryPointsData.map((d) => d.date),
    datasets: [
      {
        label: "Delivery Points",
        data: deliveryPointsData.map((d) => d.delivery_points),
        backgroundColor: systemColors.danger,
        borderColor: systemColors.primary,
        borderWidth: 1,
      },
    ],
  };

  const dailyDeliveriesChartData = {
    labels: dailyDeliveriesData.map((d) => d.date),
    datasets: [
      {
        label: "Completed Deliveries",
        data: dailyDeliveriesData.map((d) => d.completed_deliveries),
        backgroundColor: systemColors.success,
        borderColor: systemColors.primary,
        borderWidth: 1,
      },
      {
        label: "Incomplete Deliveries",
        data: dailyDeliveriesData.map((d) => d.incomplete_deliveries),
        backgroundColor: systemColors.danger,
        borderColor: systemColors.primary,
        borderWidth: 1,
      },
      {
        label: "Pending Deliveries",
        data: dailyDeliveriesData.map((d) => d.pending_deliveries),
        backgroundColor: systemColors.warning,
        borderColor: systemColors.primary,
        borderWidth: 1,
      },
    ],
  };

  const doughnutChartData = {
    labels: ["Completed", "Incomplete", "Pending"],
    datasets: [
      {
        label: "Overall Delivery Status",
        data: [
          overallStatusData.completed || 0,
          overallStatusData.incomplete || 0,
          overallStatusData.pending || 0,
        ],
        backgroundColor: [
          systemColors.success,
          systemColors.danger,
          systemColors.warning,
        ],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className="container-fluid">
      <Sidebar isOpen={isOpen} />
      <main className="main-content">
        <Header />
        <div className="dashboard">
          <div className="dashboard-widget">
            <h3>Completion Rate</h3>
            <Line data={completionRateChartData} />
          </div>
          <div className="dashboard-widget">
            <h3>Delivery Points Per Day</h3>
            <Bar data={deliveryPointsChartData} />
          </div>
          <div className="dashboard-widget">
            <h3>Daily Deliveries by Status</h3>
            <Bar data={dailyDeliveriesChartData} />
          </div>
          <div className="dashboard-widget">
            <h3>Overall Delivery Status Distribution</h3>
            <Doughnut data={doughnutChartData} />
          </div>
        </div>
      </main>
      <style jsx>{`
        .container-fluid {
          height: 100vh;
          display: flex;
          overflow: hidden;
        }

        .main-content {
          margin-left: ${isOpen ? "240px" : "80px"};
          margin-top: 60px;
          padding: 20px;
          background-color: ${systemColors.background};
          flex-grow: 1;
          overflow-y: auto;
        }

        .dashboard {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .dashboard-widget {
          background-color: #fff;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .dashboard-widget h3 {
          margin-bottom: 20px;
          font-size: 18px;
          color: ${systemColors.primary};
        }
      `}</style>
    </div>
  );
};

export default Home;
