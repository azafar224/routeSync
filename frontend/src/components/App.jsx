import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./forms/Login";
import Register from "./forms/Register";
import RouteOptimization from "./pages/RouteOptimization";
import TrackDeliveries from "./pages/TrackDeliveries";
import VehicleRoutesMap from "./pages/VehicleRoutesMap";
import ForgotPassword from "./forms/ForgotPassword";
import ResetPassword from "./forms/ResetPassword";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user")); // Check user in localStorage
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
          <Route
            path="/vehicleroutesmap"
            element={
              <PrivateRoute>
                <VehicleRoutesMap />
              </PrivateRoute>
            }
          />
          <Route
            path="/routeoptimization"
            element={
              <PrivateRoute>
                <RouteOptimization />
              </PrivateRoute>
            }
          />
          <Route
            path="/trackdeliveries"
            element={
              <PrivateRoute>
                <TrackDeliveries />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
