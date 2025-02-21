import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSideBar";
import { Box } from "@mui/material";
import { useEmployee } from "../context/EmployeeContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const EmployeeLayout = () => {
  const { employeeId } = useEmployee();
  const [employee, setEmployee] = useState({ name: "", profileImage: "", EmployeeId: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (employeeId) {
        try {
          const docRef = doc(db, "Employee", employeeId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setEmployee(docSnap.data());
          } else {
            console.error("No employee data found");
          }
        } catch (error) {
          console.error("Error fetching employee data:", error);
        }
      }
    };

    fetchEmployeeData();
  }, [employeeId, db]);

  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <EmployeeSidebar employee={employee} isOpen={isSidebarOpen} onMenuClick={handleMenuClick} setOpen={setIsSidebarOpen} />
      <Box sx={{ flexGrow: 1, padding: "20px", marginTop: "64px", width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default EmployeeLayout;
