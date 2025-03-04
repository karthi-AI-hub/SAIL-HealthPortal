import React from "react";
import { EmployeeProvider } from "./context/EmployeeContext";
import { DoctorProvider } from "./context/DoctorContext";
import { TechnicianProvider } from "./context/TechnicianContext";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";

import DoctorLayout from "./components/DoctorLayout";
import EmployeeLayout from "./components/EmployeeLayout";
import TechnicianLayout from "./components/TechnicianLayout.js"

import EmployeRegister from "./pages/employee/EmployeeRegister";
import EmployeLogin from "./pages/employee/EmployeLogin";
import EmployeeProfile from "./pages/employee/EmployeeProfile";
import EmployeeTablets from "./pages/employee/EmployeeTablets";
import EmployeeReports from "./pages/employee/EmployeeReports";
import EmployeeDoctors from "./pages/employee/EmployeeDoctors";
import EmployeDashboard from "./pages/employee/EmployeeDashboard";
import EmployeeAppointments from "./pages/employee/EmployeeAppointments";

import DoctorRegister from "./pages/doctor/DoctorRegister";
import DoctorLogin from "./pages/doctor/DoctorLogin";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorProfile from "./pages/doctor/DoctorProfile";
import DoctorPatients from "./pages/doctor/DoctorPatients";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";

import TechnicianRegister from "./pages/technician/TechnicianRegister";
import TechnicianLogin from "./pages/technician/TechnicianLogin";
import TechnicianDashboard from "./pages/technician/TechnicianDashboard.js";
import TechnicianProfile from "./pages/technician/TechnicianProfile";

function App() {
  return (
    <EmployeeProvider>
      <DoctorProvider>
        <TechnicianProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth/employee/register" element={<EmployeRegister />} />
            <Route path="/auth/employee/login" element={<EmployeLogin />} />
            <Route path="/auth/doctor/register" element={<DoctorRegister />} />
            <Route path="/auth/doctor/login" element={<DoctorLogin />} />
            <Route path="/auth/technician/register" element={<TechnicianRegister />} />
            <Route path="/auth/technician/login" element={<TechnicianLogin />} />
           
            <Route element={<EmployeeLayout />}>
              <Route path="/employee/doctorslist" element={<EmployeeDoctors />} />
              <Route path="/employee/profile" element={<EmployeeProfile />} />
              <Route path="/employee/reports" element={<EmployeeReports />} />
              <Route path="/employee/tablets" element={<EmployeeTablets />} />
              <Route path="/employee/dashboard" element={<EmployeDashboard />} />
              <Route path="/employee/appointments" element={<EmployeeAppointments />} />
            </Route>
            <Route element={<DoctorLayout />}>
              <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
              <Route path="/doctor/profile" element={<DoctorProfile />} />
              <Route path="/doctor/patients" element={<DoctorPatients />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            </Route>
            <Route element={<TechnicianLayout/>}>
            <Route path="/technician/dashboard" element={<TechnicianDashboard />} />
            <Route path="/technician/profile" element={<TechnicianProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        </TechnicianProvider>
      </DoctorProvider>
    </EmployeeProvider>
  );
}

export default App;