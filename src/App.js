import React from "react";
import { EmployeeProvider } from "./context/EmployeeContext";
import { DoctorProvider } from "./context/DoctorContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import EmployeLogin from "./pages/EmployeLogin";
import EmployeRegister from "./pages/EmployeeRegister";

import EmployeeLayout from "./components/EmployeeLayout";
import DoctorLayout from "./components/DoctorLayout";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeTablets from "./pages/EmployeeTablets";
import EmployeeReports from "./pages/EmployeeReports";
import EmployeeDoctors from "./pages/EmployeeDoctors";
import EmployeDashboard from "./pages/EmployeeDashboard";
import EmployeeAppointments from "./pages/EmployeeAppointments";
import SplashScreen from "./pages/SplashScreen";
import DoctorRegister from "./pages/DoctorRegister";
import DoctorLogin from "./pages/DoctorLogin";

import DoctorDashboard from "./pages/DoctorDashboard";
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