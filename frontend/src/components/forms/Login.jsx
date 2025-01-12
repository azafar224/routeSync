import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import backgroundImage from "./../../assets/background.jpg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginStatus, setLoginStatus] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    axios
      .post("http://localhost:3001/auth/login", { email, password })
      .then((result) => {
        if (result.data.message === "Login successful") {
          localStorage.setItem("user", JSON.stringify(result.data.user));
          setLoginStatus("success");
          navigate("/home");
        } else if (result.data.message === "Access denied") {
          setLoginStatus("role_pending");
        } else {
          setLoginStatus("invalid_credentials");
        }
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          setLoginStatus("role_pending");
        } else {
          setLoginStatus("invalid_credentials");
        }
      });
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>RouteSync</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <label htmlFor="email" style={styles.label}>
              <strong>Email Address</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              style={styles.input}
              id="email"
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div style={styles.inputContainer}>
            <label htmlFor="password" style={styles.label}>
              <strong>Password</strong>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                style={styles.input}
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                type="button"
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </button>
            </div>
          </div>
          <button type="submit" style={styles.button}>
            Login
          </button>
          {loginStatus === "invalid_credentials" && (
            <p style={styles.errorText}>
              Invalid credentials! Please try again.
            </p>
          )}
          {loginStatus === "role_pending" && (
            <p style={styles.errorText}>
              Access denied. Wait for confirmation.
            </p>
          )}
        </form>
        <Link to="/forgot-password" style={styles.forgotPasswordLink}>
          Forgot Password?
        </Link>
        <p style={styles.registerText}>Don't have an account?</p>
        <Link to="/register" style={styles.registerButton}>
          Register
        </Link>
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
    color: "#333",
    marginBottom: "20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "42px",
    fontWeight: "bold",
  },
  inputContainer: {
    marginBottom: "20px",
  },
  label: {
    marginBottom: "5px",
    display: "block",
    fontWeight: "bold",
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
    border: "none",
    backgroundColor: "#F15B5B",
    color: "#fff",
    cursor: "pointer",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    fontWeight: "bold",
  },
  forgotPasswordLink: {
    display: "block",
    textAlign: "center",
    marginTop: "10px",
    color: "#003C43",
    textDecoration: "none",
    fontSize: "14px",
  },
  errorText: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
    fontSize: "14px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "10px",
    fontSize: "14px",
    color: "#333",
  },
  registerButton: {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    backgroundColor: "#003C43",
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
    fontSize: "16px",
  },
};

export default Login;
