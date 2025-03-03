import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  Typography,
  CircularProgress,
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

const ReportUploadDialog = ({ open, onClose, patientId }) => {
  const [reportName, setReportName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (reportName && file) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("patientId", patientId);
        formData.append("fileName", reportName);

        const response = await fetch("https://sail-backend.onrender.com/upload-report", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

        const data = await response.json();
        alert("File uploaded successfully!");
        onClose(true);
      } catch (error) {
        alert("Error uploading file: " + error.message);
        onClose(false, error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)}>
      <DialogTitle>Upload Report</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Report Name"
          fullWidth
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
        />
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" component="label" disabled={loading}>
            Choose File
            <input type="file" hidden onChange={handleFileChange} />
          </Button>
          {file && <Typography variant="body2" sx={{ mt: 1 }}>{file.name}</Typography>}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)} disabled={loading}>Cancel</Button>
        <Button onClick={handleUpload} disabled={!reportName || !file || loading}>
          {loading ? <CircularProgress size={24} /> : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RescheduleDialog;
export { ReportUploadDialog };