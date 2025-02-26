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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useDoctor } from "../../context/DoctorContext";
import { CheckCircle, Pending, Cancel, Schedule, Visibility } from "@mui/icons-material";
import EmployeeProfileModal from "../../components/EmployeeProfileModal";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedTab, setSelectedTab] = useState("Upcoming");
  const [loading, setLoading] = useState(true);
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [declineReason, setDeclineReason] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const db = getFirestore();
  const { doctorId } = useDoctor();
  const theme = useTheme();

  useEffect(() => {
    if (doctorId && selectedTab) {
      fetchAppointments();
    }
  }, [doctorId, selectedTab]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsRef = collection(db, "Appointments");
      const q = query(
        appointmentsRef,
        where("DoctorId", "==", doctorId),
        where("Status", "in", selectedTab === "Upcoming" ? ["Upcoming", "Late"] : [selectedTab])
      );
      const snapshot = await getDocs(q);
      const appointmentsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Fetch patient names
      const appointmentsWithPatientNames = await Promise.all(
        appointmentsList.map(async (appointment) => {
          const patientRef = doc(db, "Employee", appointment.EmployeeId);
          const patientSnap = await getDoc(patientRef);
          const patientData = patientSnap.exists() ? patientSnap.data() : null;
          return { ...appointment, PatientName: patientData?.Name || "N/A" };
        })
      );

      setAppointments(appointmentsWithPatientNames);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptAppointment = async (appointmentId) => {
    try {
      await updateDoc(doc(db, "Appointments", appointmentId), {
        Status: "Completed",
      });
      fetchAppointments();
    } catch (error) {
      console.error("Error accepting appointment:", error);
    }
  };

  const handleOpenDeclineDialog = (appointment) => {
    setSelectedAppointment(appointment);
    setDeclineDialogOpen(true);
  };

  const handleCloseDeclineDialog = () => {
    setDeclineDialogOpen(false);
    setSelectedAppointment(null);
    setDeclineReason("");
  };

  const handleDeclineAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      await updateDoc(doc(db, "Appointments", selectedAppointment.id), {
        Status: "Failed",
        DeclineReason: declineReason,
      });
      fetchAppointments();
      handleCloseDeclineDialog();
    } catch (error) {
      console.error("Error declining appointment:", error);
    }
  };

  const handleOpenProfileModal = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setProfileModalOpen(true);
  };

  const handleCloseProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedEmployeeId(null);
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
        View and manage your appointments with patients.
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
                    {selectedTab === "Upcoming" && <TableCell>Actions</TableCell>}
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
                      <TableCell>
                        <Tooltip title="View Profile">
                          <IconButton onClick={() => handleOpenProfileModal(appointment.EmployeeId)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {appointment.PatientName || "N/A"}
                      </TableCell>
                      <TableCell>{appointment.Date || "N/A"}</TableCell>
                      <TableCell>{appointment.Time || "N/A"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          {getStatusIcon(appointment.Status)}
                          {appointment.Status}
                        </Box>
                        {appointment.Status === "Failed" && appointment.DeclineReason && (
                          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                            Reason: {appointment.DeclineReason}
                          </Typography>
                        )}
                      </TableCell>
                      {selectedTab === "Upcoming" && (
                        <TableCell>
                          <Button variant="contained" color="success" onClick={() => handleAcceptAppointment(appointment.id)}>
                            Accept
                          </Button>
                          <Button variant="outlined" color="error" onClick={() => handleOpenDeclineDialog(appointment)} sx={{ ml: 2 }}>
                            Decline
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      )}
      <Dialog open={declineDialogOpen} onClose={handleCloseDeclineDialog}>
        <DialogTitle>Decline Appointment</DialogTitle>
        <DialogContent>
          <TextField
            label="Reason for Decline"
            value={declineReason}
            onChange={(e) => setDeclineReason(e.target.value)}
            fullWidth
            multiline
            rows={4}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeclineDialog}>Cancel</Button>
          <Button onClick={handleDeclineAppointment} color="primary">Decline</Button>
        </DialogActions>
      </Dialog>
      <EmployeeProfileModal
        open={profileModalOpen}
        onClose={handleCloseProfileModal}
        employeeId={selectedEmployeeId}
      />
    </Box>
  );
};

export default DoctorAppointments;