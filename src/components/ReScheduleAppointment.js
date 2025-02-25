import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";

const RescheduleDialog = ({ open, onClose, appointment, onSave }) => {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (appointment) {
      setNewDate(appointment.Date);
      setNewTime(appointment.Time);
    }
  }, [appointment]);

  const handleSave = () => {
    if (!appointment) return;

    const appointmentDateTime = new Date(`${newDate} ${newTime}`);
    const now = new Date();

    if (appointmentDateTime < now) {
      setError("You have selected a past date or time. Please choose a future date and time.");
      return;
    }
    setError("");
    
    onSave(appointment.id, newDate, newTime);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Reschedule Appointment</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="New Date"
          type="date"
          value={newDate}
          onChange={(e) => setNewDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="New Time"
          type="time"
          value={newTime}
          onChange={(e) => setNewTime(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} color="primary">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleDialog;