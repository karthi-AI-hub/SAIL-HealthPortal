import React, { useState, useEffect } from "react";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
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
  Alert,
  Skeleton,
  useTheme,
  Card,
  CardContent,
  Grid,
  Button,
} from "@mui/material";
import { useEmployee } from "../../context/EmployeeContext";
import { CheckCircle, Pending, Cancel, Schedule } from "@mui/icons-material"; // Icons for appointment status
import RescheduleDialog from "./../../components/ReScheduleAppointment"; // Import the dialog component

const EmployeeAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const db = getFirestore();
  const { employeeId } = useEmployee();
  const theme = useTheme();

  useEffect(() => {
    if (employeeId && selectedTab) {
      fetchAppointments();
    }
  }, [employeeId, selectedTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsRef = collection(db, "Appointments");
      const q = query(appointmentsRef, where("EmployeeId", "==", employeeId), where("Status", "==", selectedTab));
      const snapshot = await getDocs(q);
      const appointmentsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const appointmentsWithDoctorDetails = await Promise.all(
        appointmentsList.map(async (appointment) => {
          const doctorRef = doc(db, "Doctors", appointment.DoctorId);
          const doctorSnap = await getDoc(doctorRef);
          const doctorData = doctorSnap.exists() ? doctorSnap.data() : null;

          const appointmentDateTime = new Date(`${appointment.Date} ${appointment.Time}`);
          const now = new Date();
          if (appointment.Status === "Upcoming" && appointmentDateTime < now) {
            appointment.Status = "Late";
            await updateDoc(doc(db, "Appointments", appointment.id), { Status: "Late" });
          }

          return { ...appointment, doctor: doctorData };
        })
      );

      setAppointments(appointmentsWithDoctorDetails);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRescheduleDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleCloseRescheduleDialog = () => {
    setRescheduleDialogOpen(false);
    setSelectedAppointment(null);
  };

  const handleSaveReschedule = async (appointmentId, newDate, newTime) => {
    try {
      const appointmentDateTime = new Date(`${newDate} ${newTime}`);
      const now = new Date();

      if (appointmentDateTime < now) {
        alert("You have selected a past date or time. Please choose a future date and time.");
        return;
      }

      await updateDoc(doc(db, "Appointments", appointmentId), {
        Date: newDate,
        Time: newTime,
        Status: "Upcoming",
      });

      fetchAppointments();
    } catch (error) {
      console.error("Error rescheduling appointment:", error);
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
      case "Late":
        return <Schedule sx={{ color: theme.palette.error.main }} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Appointments
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        View and manage your appointments with doctors.
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
        <Tab label="Late" value="Late" />
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
            selectedTab === "Upcoming" ? (
              <Grid container spacing={3} sx={{ mt: 3 }}>
                {appointments.map((appointment) => (
                  <Grid item xs={12} md={6} key={appointment.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" fontWeight="bold">
                          Appointment with Dr. {appointment.doctor?.Name || "N/A"} 
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Specialization: {appointment.doctor?.Specialization || "N/A"}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Contact: {appointment.doctor?.Phone || "N/A"}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Date: {appointment.Date || "N/A"}
                        </Typography>
                        <Typography variant="body1" color="textSecondary">
                          Time: {appointment.Time || "N/A"}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getStatusIcon(appointment.Status)}
                          <Typography variant="body1" color="textSecondary">
                            Status: {appointment.Status || "N/A"}
                          </Typography>
                        </Box>
                        {appointment.Status !== "Completed" && (
                          <Button variant="outlined" sx={{ mt: 2 }} onClick={() => handleOpenRescheduleDialog(appointment)}>
                            Reschedule
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <TableContainer component={Paper} sx={{ mt: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Doctor Name</TableCell>
                      <TableCell>Specialization</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Status</TableCell>
                      {selectedTab !== "Completed" && <TableCell>Actions</TableCell>}
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
                        <TableCell>{appointment.doctor?.Name || "N/A"}</TableCell>
                        <TableCell>{appointment.doctor?.Specialization || "N/A"}</TableCell>
                        <TableCell>{appointment.doctor?.Phone || "N/A"}</TableCell>
                        <TableCell>{appointment.Date || "N/A"}</TableCell>
                        <TableCell>{appointment.Time || "N/A"}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            {getStatusIcon(appointment.Status)}
                            {appointment.Status}
                          </Box>
                        </TableCell>
                        {selectedTab !== "Completed" && (
                          <TableCell>
                            <Button variant="outlined" onClick={() => handleOpenRescheduleDialog(appointment)}>
                              Reschedule
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          )}
        </>
      )}
      <RescheduleDialog
        open={rescheduleDialogOpen}
        onClose={handleCloseRescheduleDialog}
        appointment={selectedAppointment}
        onSave={handleSaveReschedule}
      />
    </Box>
  );
};

export default EmployeeAppointments;