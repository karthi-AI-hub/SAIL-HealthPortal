import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import TechnicianSidebar from "./TechnicianSidebar";
import { Box } from "@mui/material";
import { useTechnician } from "../context/TechnicianContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const TechnicianLayout = () => {
  const { technicianId } = useTechnician();
  const [technician, setTechnician] = useState({ name: "", profileImage: "", TechnicianId: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchTechnicianData = async () => {
      if (technicianId) {
        try {
          const docRef = doc(db, "Technicians", technicianId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setTechnician(docSnap.data());
          } else {
            console.error("No technician data found");
          }
        } catch (error) {
          console.error("Error fetching technician data:", error);
        }
      }
    };

    fetchTechnicianData();
  }, [technicianId, db]);

  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <TechnicianSidebar technician={technician} isOpen={isSidebarOpen} onMenuClick={handleMenuClick} setOpen={setIsSidebarOpen} />
      <Box sx={{ flexGrow: 1, padding: "20px", marginTop: "64px", width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default TechnicianLayout;

