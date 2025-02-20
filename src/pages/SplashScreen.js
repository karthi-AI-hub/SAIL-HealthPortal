import React from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import logo from "../assets/logo.png";

const SplashScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      
      <div className="mb-4">
        <img src={logo} alt="Sail Logo" width={250} />
      </div>
      
      <h3 className="mb-4 text-center">SAIL - Health Management System</h3>
      
      
      <div className="w-75">
        <button className="btn btn-primary w-100 mb-3" onClick={() => navigate("/auth/employee/login")}> 
          Continue as Employee
        </button>
        <button className="btn btn-success w-100" 
        onClick={() => navigate("/auth/doctor/login")}
        > 
          Continue as Doctor
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;
