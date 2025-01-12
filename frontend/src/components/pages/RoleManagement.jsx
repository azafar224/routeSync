import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../layout/Sidebar";
import Header from "../layout/Header";
import { useNavigate } from "react-router-dom";

const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));
    if (!loggedInUser || loggedInUser.role !== "Administrator") {
      alert("Access denied. Only administrators can access this page.");
      navigate("/home");
      return;
    }

    axios
      .get("http://localhost:3001/role_management/users", {
        withCredentials: true,
      })
      .then((response) => {
        setUsers(response.data.users);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch users.");
        setLoading(false);
      });
  }, [navigate]);

  const handleRoleChange = (email, newRole) => {
    if (!email || !newRole) {
      alert("Email and role are required.");
      return;
    }

    axios
      .post(
        "http://localhost:3001/role_management/grantRole",
        { email, role: newRole },
        { withCredentials: true }
      )
      .then((response) => {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.email === email ? { ...user, role: newRole } : user
          )
        );
        alert(response.data.message);
      })
      .catch((error) => {
        console.error("Error updating role:", error.response?.data || error);
        alert("Failed to update role.");
      });
  };

  return (
    <div className="container-fluid">
      <Sidebar isOpen={true} />
      <main className="main-content">
        <Header />
        <div className="role-management-content">
          <h2>Role Management</h2>
          {loading ? (
            <p>Loading users...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <div className="user-table-wrapper">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Change Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.email}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.email, e.target.value)
                          }
                          disabled={user.role === "Administrator"}
                        >
                          <option value="User">User</option>
                          <option value="Logistic Manager">
                            Logistic Manager
                          </option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <style jsx>{`
        .container-fluid {
          display: flex;
          height: 100vh;
          overflow: hidden;
        }

        .main-content {
          margin-left: 240px;
          margin-top: 60px;
          padding: 20px;
          background-color: #f8f9fa;
          flex-grow: 1;
          overflow-y: auto;
        }

        .role-management-content {
          padding: 30px;
          background: white;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          margin: 20px;
        }

        .role-management-content h2 {
          text-align: center;
          margin-bottom: 20px;
          font-size: 24px;
          color: #333;
        }

        .user-table-wrapper {
          overflow-x: auto;
        }

        .user-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 10px;
          overflow: hidden;
        }

        .user-table th,
        .user-table td {
          padding: 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }

        .user-table th {
          background-color: #f15b5b;
          color: white;
          font-size: 16px;
        }

        .user-table tr:hover {
          background-color: #f1f1f1;
        }

        .user-table td {
          font-size: 14px;
        }

        select {
          padding: 5px;
          border: 1px solid #ccc;
          border-radius: 5px;
          background: #f8f8f8;
        }

        select:disabled {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default RoleManagement;
