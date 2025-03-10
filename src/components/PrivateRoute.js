import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AccessDenied from "../pages/AccessDenied";
import LoadingSpinner from "../components/LoadingSpinner";

const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AccessDenied />;
  }

  if (role && user.role !== role) {
    return <AccessDenied />;
  }

  return children;
};

export default PrivateRoute;