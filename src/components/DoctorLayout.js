import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import DoctorSidebar from "./DoctorSideBar";
import { Box } from "@mui/material";
import { useDoctor } from "../context/DoctorContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const DoctorLayout = () => {
  const { doctorId } = useDoctor();
  const [doctor, setDoctor] = useState({ name: "", profileImage: "", DoctorId: "" });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const db = getFirestore();

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (doctorId) {
        try {
          const docRef = doc(db, "Doctors", doctorId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setDoctor(docSnap.data());
          } else {
            console.error("No doctor data found");
          }
        } catch (error) {
          console.error("Error fetching doctor data:", error);
        }
      }
    };

    fetchDoctorData();
  }, [doctorId, db]);

  const handleMenuClick = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <DoctorSidebar doctor={doctor} isOpen={isSidebarOpen} onMenuClick={handleMenuClick} setOpen={setIsSidebarOpen} />
      <Box sx={{ flexGrow: 1, padding: "20px", marginTop: "64px", width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default DoctorLayout;