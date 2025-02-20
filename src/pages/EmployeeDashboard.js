import React, { useState, useEffect } from "react";
import { useWorker } from "../context/UserContext";
import EmployeeSidebar from "../components/EmployeeSideBar";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import "./../components/EmployeeSideBar.css";

const EmployeeDashboard = () => {
  const { employeeId } = useWorker();
  const auth = getAuth();
  const db = getFirestore();

  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && employeeId) {
        try {
          const docRef = doc(db, "Employee", employeeId);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            setEmployeeData(docSnap.data());
          } else {
            console.error("No employee data found");
          }
        } catch (error) {
          console.error("Error fetching employee data:", error);
        }
      } else {
        setEmployeeData(null);
      }
    });

    return () => unsubscribe();
  }, [auth, db, employeeId]);

  return (
    <div style={{ display: "flex" }}>
      <EmployeeSidebar employee={employeeData || { name: "", role: "", profileImage: "" }} />
      
      <div style={{ flex: 1, padding: "20px" }}>
        <h2>
          Hi, {employeeData ? employeeData.name : "Employee"}
        </h2>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
