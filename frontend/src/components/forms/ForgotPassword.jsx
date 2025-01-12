import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import backgroundImage from "./../../assets/background.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:3001/auth/forgotpassword", { email })
      .then((response) => {
        setStatus("success");
      })
      .catch((error) => {
        setStatus("error");
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Forgot Password</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              style={styles.input}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" style={styles.button}>
            Send Reset Link
          </button>
        </form>
        {status === "success" && (
          <p style={styles.successText}>
            A reset link has been sent to your email.
          </p>
        )}
        {status === "error" && (
          <p style={styles.errorText}>
            Error sending reset link. Please try again.
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
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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

export default ForgotPassword;
