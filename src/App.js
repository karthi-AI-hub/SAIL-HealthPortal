// App.js
import React from "react";
import { EmployeeProvider } from "./context/EmployeeContext";
import { DoctorProvider } from "./context/DoctorContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import NotFound from "./pages/NotFound";
import SplashScreen from "./pages/SplashScreen";

import DoctorLayout from "./components/DoctorLayout";
import EmployeeLayout from "./components/EmployeeLayout";

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
import DoctorReports from "./pages/doctor/DoctorReports";
import DoctorAppointments from "./pages/doctor/DoctorAppointments";
import DoctorPrescriptions from "./pages/doctor/DoctorPrescriptions";

function App() {
  return (
    <EmployeeProvider>
      <DoctorProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/auth/employee/register" element={<EmployeRegister />} />
            <Route path="/auth/employee/login" element={<EmployeLogin />} />
            <Route path="/auth/doctor/register" element={<DoctorRegister />} />
            <Route path="/auth/doctor/login" element={<DoctorLogin />} />
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
              <Route path="/doctor/reports" element={<DoctorReports />} />
              <Route path="/doctor/appointments" element={<DoctorAppointments />} />
              <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </DoctorProvider>
    </EmployeeProvider>
  );
}

export default App;