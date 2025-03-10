import React from "react";
import { Navigate } from "react-router-dom";
import { useEmployee } from "../context/EmployeeContext";
import { useDoctor } from "../context/DoctorContext";
import { useTechnician } from "../context/TechnicianContext";
import AccessDenied from "../pages/AccessDenied";

const PrivateRoute = ({ children, role }) => {
  const { employeeId } = useEmployee();
  const { doctorId } = useDoctor();
  const { technicianId } = useTechnician();

  if (role === "employee" && !employeeId) {
    return <AccessDenied />;
  }

  if (role === "doctor" && !doctorId) {
    return <AccessDenied />;
  }

  if (role === "technician" && !technicianId) {
    return <AccessDenied />;
  }

  return children;
};

export default PrivateRoute;