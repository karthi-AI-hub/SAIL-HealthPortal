import React from "react";
import { WorkerProvider } from "./context/UserContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";

import EmployeLogin  from "./pages/EmployeLogin";
import EmployeRegister  from "./pages/EmployeeRegister";

import EmployeeLayout from "./components/EmployeeLayout"

import EmployeeProfile from "./pages/EmployeeProfile"; 
import EmployeeTablets from "./pages/EmployeeTablets"; 
import EmployeeReports from "./pages/EmployeeReports"; 
import EmployeeDoctors from "./pages/EmployeeDoctors"; 
import EmployeDashboard from "./pages/EmployeeDashboard"; 
import EmployeeAppointments from "./pages/EmployeeAppointments"; 

import SplashScreen from "./pages/SplashScreen";

import DoctorRegister from "./pages/DoctorRegister"
import DoctorLogin from "./pages/DoctorLogin"

import DoctorDashboard from "./pages/DoctorDashboard"

function App() {
  const employee = { name: "", profileImage: "", EmployeeId: "" };

  return (
    <WorkerProvider>
      <Router>
      <Routes>
        <Route path="/" element={<SplashScreen/>} />

        <Route path="/auth/employee/register" element={<EmployeRegister/>} />
        <Route path="/auth/employee/login" element={<EmployeLogin/>} />

        <Route path="/auth/doctor/register" element={<DoctorRegister/>} />
        <Route path="/auth/doctor/login" element={<DoctorLogin/>} />

        <Route element={<EmployeeLayout employee={employee} />}>
        <Route path="/employee/doctorslist" element={<EmployeeDoctors/>} />
        <Route path="/employee/profile" element={<EmployeeProfile/>} />
        <Route path="/employee/reports" element={<EmployeeReports/>} />
        <Route path="/employee/tablets" element={<EmployeeTablets/>} />
        <Route path="/employee/dashboard" element={<EmployeDashboard/>} />
        <Route path="/employee/appointments" element={<EmployeeAppointments/>} />
        </Route>

        <Route path="/doctor/dashboard" element={<DoctorDashboard/>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </WorkerProvider>
  );
}

export default App;
