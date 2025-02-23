// import React from "react";
// import { useDoctor } from "../../context/DoctorContext";

// const DoctorDashboard = () => {
//   const { doctor } = useDoctor();

//   return (
//     <div>
//       <h1>Welcome, {doctor ? doctor.name : "Loading..."}</h1>
//       {/* Add your dashboard content here */}
//     </div>
//   );
// };

// export default DoctorDashboard;


import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Skeleton,
  useTheme,
  Button,
} from "@mui/material";
import { CheckCircle, Pending, Cancel } from "@mui/icons-material"; // Icons for appointment status

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const theme = useTheme();

  useEffect(() => {
    if (selectedTab) {
      fetchAppointments();
    }
  }, [selectedTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsRef = collection(db, "Appointments");
      const q = query(appointmentsRef, where("Status", "==", selectedTab));
      const snapshot = await getDocs(q);
      const appointmentsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(appointmentsList);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (appointmentId, newStatus) => {
    try {
      const appointmentRef = doc(db, "Appointments", appointmentId);
      await updateDoc(appointmentRef, { Status: newStatus });
      fetchAppointments(); // Refresh the list after updating
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      case "Upcoming":
        return <Pending sx={{ color: theme.palette.warning.main }} />;
      case "Failed":
        return <Cancel sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Doctor Dashboard
      </Typography>
      <Tabs
        value={selectedTab}
        onChange={(e, newValue) => setSelectedTab(newValue)}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ mb: 3 }}
      >
        <Tab label="Upcoming" value="Upcoming" />
        <Tab label="Completed" value="Completed" />
        <Tab label="Failed" value="Failed" />
      </Tabs>
      {loading ? (
        <Box>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
          ))}
        </Box>
      ) : (
        <>
          {appointments.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3 }}>
              No appointments found for the selected status.
            </Alert>
          ) : (
            <TableContainer component={Paper} sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient Name</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {appointments.map((appointment) => (
                    <TableRow
                      key={appointment.id}
                      sx={{
                        "&:nth-of-type(odd)": { backgroundColor: theme.palette.action.hover },
                      }}
                    >
                      <TableCell>{appointment.EmployeeId}</TableCell>
                      <TableCell>{appointment.Date}</TableCell>
                      <TableCell>{appointment.Time}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getStatusIcon(appointment.Status)}
                          {appointment.Status}
                        </Box>
                      </TableCell>
                      <TableCell>
                        {appointment.Status === "Upcoming" && (
                          <>
                            <Button
                              variant="contained"
                              color="success"
                              sx={{ mr: 1 }}
                              onClick={() => updateAppointmentStatus(appointment.id, "Completed")}
                            >
                              Mark as Completed
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              onClick={() => updateAppointmentStatus(appointment.id, "Failed")}
                            >
                              Mark as Failed
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
    </Box>
  );
};

export default DoctorDashboard;