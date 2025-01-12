import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import backgroundImage from "./../../assets/background.jpg";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  // Extract token from query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handleReset = async (e) => {
    e.preventDefault();

    if (!token) {
      setMessage("Invalid or missing reset token.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:3001/auth/reset-password",
        {
          reset_token: token,
          new_password: newPassword,
        }
      );
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 3000); // Redirect to login
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Reset Password</h2>
        <form onSubmit={handleReset}>
          <div style={styles.inputContainer}>
            <label htmlFor="newPassword" style={styles.label}>
              New Password
            </label>
            <input
              type="password"
              placeholder="Enter your new password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>
            Reset Password
          </button>
        </form>
        {message && (
          <p
            style={
              message.includes("successfully")
                ? styles.successText
                : styles.errorText
            }
          >
            {message}
          </p>
        )}
        <div style={styles.linkContainer}>
          <Link to="/login" style={styles.link}>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: "40px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "24px",
    color: "#333",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  label: {
    marginBottom: "5px",
    display: "block",
    fontSize: "14px",
    color: "#333",
  },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    backgroundColor: "#003C43",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  successText: {
    color: "green",
    textAlign: "center",
    marginTop: "10px",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    marginTop: "10px",
  },
  linkContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  link: {
    color: "#003C43",
    textDecoration: "none",
    fontSize: "14px",
  },
};

export default ResetPassword;
