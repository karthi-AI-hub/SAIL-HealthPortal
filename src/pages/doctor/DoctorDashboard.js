import React from "react";
import { useDoctor } from "../../context/DoctorContext";

const DoctorDashboard = () => {
  const { doctor } = useDoctor();

  return (
    <div>
      <h1>Welcome, {doctor ? doctor.name : "Loading..."}</h1>
      {/* Add your dashboard content here */}
    </div>
  );
};

export default DoctorDashboard;
