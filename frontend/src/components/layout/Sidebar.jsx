import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaRoute,
  FaTruck,
  FaSignOutAlt,
  FaUserCircle,
} from "react-icons/fa";
import axios from "axios";
import logo from "./../../assets/logo.jpg";

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3001/auth/logout",
        {},
        { withCredentials: true }
      );
      if (response.status === 200) {
        localStorage.removeItem("user"); // Clear user data
        alert("Logged out successfully!");
        navigate("/login");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("An error occurred while logging out.");
    }
  };

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="logo-container">
        {isOpen ? (
          <>
            <img src={logo} alt="RouteSync Logo" className="logo-image" />
            <h1 className="logo-text">RouteSync</h1>
          </>
        ) : (
          <img src={logo} alt="RouteSync Logo" className="logo-image-closed" />
        )}
      </div>
      <nav className="menu">
        <ul>
          <li className={location.pathname === "/home" ? "active" : ""}>
            <Link to="/home">
              <FaHome className="icon" />
              {isOpen && <span>Dashboard</span>}
            </Link>
          </li>
          <li
            className={
              location.pathname === "/routeoptimization" ? "active" : ""
            }
          >
            <Link to="/routeoptimization">
              <FaRoute className="icon" />
              {isOpen && <span>Route Optimization</span>}
            </Link>
          </li>
          <li
            className={location.pathname === "/trackdeliveries" ? "active" : ""}
          >
            <Link to="/trackdeliveries">
              <FaTruck className="icon" />
              {isOpen && <span>Track Deliveries</span>}
            </Link>
          </li>
          <li
            className={location.pathname === "/rolemanagement" ? "active" : ""}
          >
            <Link to="/rolemanagement">
              <FaUserCircle className="icon" />
              {isOpen && <span>Role Management</span>}
            </Link>
          </li>
          <li>
            <button className="logout-button" onClick={handleLogout}>
              <FaSignOutAlt className="icon" />
              {isOpen && <span>Logout</span>}
            </button>
          </li>
        </ul>
      </nav>
      <style jsx>{`
        .sidebar {
          width: ${isOpen ? "250px" : "70px"};
          min-width: 70px;
          background-color: #f8f9fa;
          box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
          transition: width 0.3s ease;
          position: fixed;
          height: 100vh;
          top: 0;
          left: 0;
          z-index: 100;
          padding-inline: 10px;
        }

        .logo-container {
          padding: ${isOpen ? "20px" : "0"};
          transition: padding 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .logo-image {
          width: ${isOpen ? "100px" : "50px"};
          display: ${isOpen ? "block" : "none"};
          margin-right: 10px;
        }

        .logo-image-closed {
          width: 50px;
          display: block;
          margin-right: 10px;
        }

        .logo-text {
          font-size: ${isOpen ? "18px" : "0"};
          margin-top: 5px;
          color: #000;
          text-align: center;
          transition: font-size 0.3s ease;
        }

        .menu ul {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }

        .menu ul li {
          margin-bottom: 10px;
          border-radius: 5px;
          background-color: transparent;
          padding: ${isOpen ? "10px" : "0"};
          display: flex;
          align-items: center;
          transition: background-color 0.3s ease;
        }

        .menu ul li.active {
          background-color: #f15b5b;
        }

        .menu ul li a {
          text-decoration: none;
          color: ${isOpen ? "#000" : "#000"};
          display: flex;
          align-items: center;
        }

        .menu ul li button.logout-button {
          background: none;
          border: none;
          color: ${isOpen ? "#000" : "#000"};
          display: flex;
          align-items: center;
          width: 100%;
          cursor: pointer;
        }

        .menu ul li button.logout-button:hover {
          color: #f15b5b;
        }

        .icon {
          margin-right: ${isOpen ? "10px" : "0"};
          margin-inline: ${!isOpen && "auto"};
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
