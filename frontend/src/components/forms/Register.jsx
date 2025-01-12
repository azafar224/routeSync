import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import backgroundImage from "./../../assets/background.jpg";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [warning, setWarning] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password.length < 8) {
      setWarning("Password must be at least 8 characters long.");
      return;
    } else {
      setWarning("");
    }

    axios
      .post("http://localhost:3001/auth/register", { name, email, password })
      .then((result) => {
        console.log(result);
        if (result.data === "Already registered") {
          setWarning("Email already registered! Please Login to proceed.");
          navigate("/login");
        } else {
          setSuccessMessage("Registered successfully! Proceed to login.");
          setName("");
          setEmail("");
          setPassword("");
        }
      })
      .catch((err) => console.log(err));
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.heading}>Register</h2>
        {warning && <p style={styles.warning}>{warning}</p>}
        {successMessage && (
          <p style={styles.successMessage}>{successMessage}</p>
        )}
        <form onSubmit={handleSubmit}>
          <div style={styles.inputContainer}>
            <label htmlFor="exampleInputName" style={styles.label}>
              <strong>Name</strong>
            </label>
            <input
              type="text"
              placeholder="Enter Name"
              className="form-control"
              id="exampleInputName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>
          <div style={styles.inputContainer}>
            <label htmlFor="exampleInputEmail1" style={styles.label}>
              <strong>Email Address</strong>
            </label>
            <input
              type="email"
              placeholder="Enter Email"
              className="form-control"
              id="exampleInputEmail1"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div style={styles.inputContainer}>
            <label htmlFor="exampleInputPassword1" style={styles.label}>
              <strong>Password</strong>
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter Password"
                className="form-control"
                id="exampleInputPassword1"
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
            Register
          </button>
        </form>
        <p style={styles.registerText}>Already have an account?</p>
        <Link to="/login" style={styles.loginLink}>
          Login
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
    minHeight: "100vh",
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
  formContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.8)", // semi-transparent white
    padding: "40px",
    borderRadius: "10px",
    width: "400px",
    boxShadow: "0px 0px 10px 0px rgba(0,0,0,0.1)",
    animation: "fadeIn 1s ease", // example animation
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
    paddingRight: "40px", // space for the icon
    borderRadius: "5px",
    border: "1px solid #ccc",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
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
  warning: {
    color: "red",
    marginTop: "10px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },
  successMessage: {
    color: "green",
    marginTop: "10px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },
  registerText: {
    textAlign: "center",
    marginTop: "10px",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
    color: "#333",
  },
  loginLink: {
    display: "block",
    width: "100%",
    padding: "12px",
    borderRadius: "5px",
    border: "none",
    backgroundColor: "#003C43",
    color: "#fff",
    textDecoration: "none",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontSize: "16px",
    fontWeight: "bold",
    marginTop: "20px",
  },
  "@keyframes fadeIn": {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
};

export default Register;
