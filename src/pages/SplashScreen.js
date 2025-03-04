import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light p-3">
      <div className="mb-4 text-center">
        <img
          src={logo}
          alt="Sail Logo"
          width={250}
          className="img-fluid"
          style={{ maxWidth: "100%" }}
        />
      </div>

      <h1 className="mb-4 text-center text-primary fw-bold">
        SAIL - Health Portal
      </h1>

      <div className="w-100" style={{ maxWidth: "500px" }}>
        <button
          className="btn btn-primary w-100 mb-3 py-2 fw-bold"
          onClick={() => navigate("/auth/employee/login")}
          aria-label="Continue as Employee"
        >
          Continue as Employee
        </button>
        <button
          className="btn btn-success w-100 py-2 fw-bold"
          onClick={() => navigate("/auth/doctor/login")}
          aria-label="Continue as Doctor"
        >
          Continue as Doctor
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;