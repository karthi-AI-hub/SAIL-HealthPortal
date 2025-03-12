import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, CircularProgress } from "@mui/material";

const ReportUploadDialog = ({ open, onClose, patientId, department, subDepartment }) => {
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
        formData.append("department", department);
        if (subDepartment) {
          formData.append("subDepartment", subDepartment);
        }

        const response = await fetch("https://sail-backend.onrender.com/upload-report", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload file");
        }

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

export default ReportUploadDialog;