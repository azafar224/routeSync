import React from "react";
import { useLocation } from "react-router-dom";

const Header = () => {
  const location = useLocation();

  // Map of routes to screen names
  const screenNames = {
    "/home": "Dashboard",
    "/routeoptimization": "Route Optimization",
    "/trackdeliveries": "Track Deliveries",
    "/vehicleroutesmap": "Routes Mapping",
  };

  // Determine the current screen name
  const currentScreen = screenNames[location.pathname] || "Screen";

  return (
    <header className="header">
      <div className="profile">
        <div className="profile-header">
          <h2>{currentScreen}</h2>
        </div>
      </div>
      <style jsx>{`
        .header {
          width: 100%;
          height: 60px;
          background: linear-gradient(to right, #0f0c29, #302b63, #24243e);
          display: flex;
          justify-content: flex-start;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 99;
          padding-left: 250px; /* Matches the open sidebar width */
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
          color: #ffffff;
        }

        .profile-header {
          display: flex;
          margin-left: 20px;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.8),
            0 0 12px rgba(255, 255, 255, 0.6);
        }

        .profile-header h2 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: var(--neon, #ffffff);
          text-shadow: 0 0 12px var(--neon-glow, rgba(255, 255, 255, 0.5));
          text-transform: uppercase;
          letter-spacing: 1.5px;
        }

        .profile {
          display: flex;
          align-items: center;
        }
      `}</style>
    </header>
  );
};

export default Header;
