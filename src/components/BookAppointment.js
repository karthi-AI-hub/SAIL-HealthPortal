import React, { useState } from "react";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { Box, Typography, Button, TextField, Modal, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import dayjs from "dayjs";

const BookAppointment = ({ open, onClose, doctor, employeeId }) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const db = getFirestore();

  const handleBookAppointment = async () => {
    if (!date || !time) {
      alert("Please select a date and time.");
      return;
    }

    if (!employeeId) {
      alert("Employee ID is missing.");
      return;
    }

    const selectedDateTime = dayjs(`${date} ${time}`);
    const now = dayjs();

    if (selectedDateTime.isBefore(now)) {
      alert("Please select a future date and time.");
      return;
    }

    const appointmentData = {
      EmployeeId: employeeId,
      DoctorId: doctor.id,
      Date: date,
      Time: time,
      Status: "Upcoming",
    };

    try {
      await addDoc(collection(db, "Appointments"), appointmentData);
      alert("Appointment booked successfully!");
      onClose();
    } catch (error) {
      console.error("Error booking appointment: ", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ p: 3, bgcolor: "background.paper", width: 400, margin: "auto", mt: 5, borderRadius: 2, boxShadow: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6">
            Book Appointment with Dr. {doctor.Name}
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <TextField
          fullWidth
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          fullWidth
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          sx={{ mb: 2 }}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={handleBookAppointment} fullWidth>
          Confirm Appointment
        </Button>
      </Box>
    </Modal>
  );
};

export default BookAppointment;