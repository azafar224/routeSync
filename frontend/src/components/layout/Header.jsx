import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // Map of routes to screen names
  const screenNames = {
    "/home": "Dashboard",
    "/routeoptimization": "Route Optimization",
    "/trackdeliveries": "Track Deliveries",
    "/rolemanagement": "Role Management",
  };

  // Determine the current screen name
  const currentScreen = screenNames[location.pathname] || "Screen";

  return (
    <header className="header">
      <div className="profile">
        <div className="profile-header">
          <h2>{currentScreen} </h2>
        </div>
      </div>
      <style jsx>{`
        .header {
          width: 100%;
          height: 60px;
          background-color: #f8f9fa;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99;
          margin-left: 230px;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .profile-header {
          display: flex;
          margin-left: 40px;
          color: #f15b5b;
        }

        .profile {
          display: flex;
          align-items: center;
          color: #f15b5b;
        }
      `}</style>
    </header>
  );
};

export default Header;
