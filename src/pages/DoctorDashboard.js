import { useWorker } from "../context/UserContext";

const DoctorDashboard = () => {
  const { employeeId } = useWorker();

  return (
    <div>
      <h2>Welcome, Company</h2>
      <p>Your Doctor Id : {employeeId}</p>
    </div>
  );
};

export default DoctorDashboard;
