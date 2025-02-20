import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div style={{ textAlign: "center", padding: "50px", fontFamily: "Arial, sans-serif" }}>
      <img src="/logo.png" alt="Sail Icon" height="300" />
      <h1 style={{ color: "red" }}>404 - Page Not Found</h1>
      <p>Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" style={{ color: "blue", fontSize: "18px", textDecoration: "none" }}>
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
