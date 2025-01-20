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

  const neonColors = {
    green: "rgb(22 245 41)",
    red: "rgba(255, 81, 97, 1)",
    yellow: "rgba(255, 255, 0, 1)",
    blue: "rgba(31, 81, 255, 1)",
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: "#ffffff",
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
      y: {
        ticks: {
          color: "#ffffff",
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.2)",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
        borderColor: neonColors.green,
        shadowBlur: 20,
        shadowColor: neonColors.green,
      },
      point: {
        backgroundColor: neonColors.green,
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  const limitToLast10Days = (data) => {
    return data.slice(-15);
  };

  const completionRateChartData = {
    labels: limitToLast10Days(completionRateData).map((d) => d.date),
    datasets: [
      {
        label: "Completion Rate",
        data: limitToLast10Days(completionRateData).map(
          (d) => d.completion_rate
        ),
        borderColor: neonColors.green,
        backgroundColor: neonColors.green,
        borderWidth: 2.5,
        tension: 0.4,
        pointBackgroundColor: neonColors.green,
        pointRadius: 5,
      },
    ],
  };

  const deliveryPointsChartData = {
    labels: limitToLast10Days(deliveryPointsData).map((d) => d.date),
    datasets: [
      {
        label: "Delivery Points",
        data: limitToLast10Days(deliveryPointsData).map(
          (d) => d.delivery_points
        ),
        backgroundColor: neonColors.blue,
      },
    ],
  };

  const dailyDeliveriesChartData = {
    labels: limitToLast10Days(dailyDeliveriesData).map((d) => d.date),
    datasets: [
      {
        label: "Completed Deliveries",
        data: limitToLast10Days(dailyDeliveriesData).map(
          (d) => d.completed_deliveries
        ),
        backgroundColor: neonColors.green,
      },
      {
        label: "Incomplete Deliveries",
        data: limitToLast10Days(dailyDeliveriesData).map(
          (d) => d.incomplete_deliveries
        ),
        backgroundColor: neonColors.red,
      },
      {
        label: "Pending Deliveries",
        data: limitToLast10Days(dailyDeliveriesData).map(
          (d) => d.pending_deliveries
        ),
        backgroundColor: neonColors.yellow,
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
        backgroundColor: [neonColors.green, neonColors.red, neonColors.yellow],
        hoverOffset: 15,
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
            <Line data={completionRateChartData} options={chartOptions} />
          </div>
          <div className="dashboard-widget">
            <h3>Delivery Points Per Day</h3>
            <Bar data={deliveryPointsChartData} options={chartOptions} />
          </div>
          <div className="dashboard-widget">
            <h3>Daily Deliveries by Status</h3>
            <Bar data={dailyDeliveriesChartData} options={chartOptions} />
          </div>
          <div className="dashboard-widget">
            <h3>Overall Delivery Status Distribution</h3>
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </main>
      <style jsx>{`
        .container-fluid {
          height: 100vh;
          display: flex;
          position: fixed;
          right: 0 px;
          overflow: hidden;
          background: linear-gradient(115deg, #3d00a6, #0c0014);
        }

        .main-content {
          margin-left: ${isOpen ? "230px" : "80px"};
          margin-top: 60px;
          right: 0px;
          padding: 20px;
          background: linear-gradient(115deg, #3d00a6, #0c0014);
          flex-grow: 1;
          overflow-y: scroll;
        }

        .main-content::-webkit-scrollbar {
          width: 12px;
          position: fixed;
          right: 0;
        }

        .main-content::-webkit-scrollbar-track {
          background: #dfe6e9;
          border-radius: 10px;
        }

        .main-content::-webkit-scrollbar-thumb {
          background-color: #6c5ce7;
          border-radius: 10px;
          border: 2px solid transparent;
        }

        .main-content::-webkit-scrollbar-thumb:hover {
          background-color: #4a3fb2;
        }

        .dashboard {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 20px;
        }

        .dashboard-widget {
          background: #021526;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .dashboard-widget h3 {
          margin-bottom: 20px;
          font-size: 18px;
          color: #ffffff;
          text-shadow: 0 0 8px ${neonColors.blue};
        }
      `}</style>
    </div>
  );
};

export default Home;
