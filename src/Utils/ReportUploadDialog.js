import React, { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, CircularProgress } from "@mui/material";

const ReportUploadDialog = ({ open, onClose, patientId, department, subDepartment }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [reportNotes, setReportNotes] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf" && selectedFile.size <= 3 * 1024 * 1024) {
      setFile(selectedFile);
    } else {
      setFile(null);
      alert("Please select a PDF file smaller than 3MB.");
    }
  };

  const handleUpload = async () => {
    if (file) {
      setLoading(true);
      try {
        const date = new Date().toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          timeZone: "Asia/Kolkata",
        }).replace(/\//g, ":");

        const time = new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
        }).slice(0, 5).replace(/:/g, ":");

        let fileName;
        if (subDepartment) {
          fileName = `${patientId}-${subDepartment}-${date}-${time}`;
        } else {
          fileName = `${patientId}-${department}-${date}-${time}`;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("patientId", patientId);
        formData.append("fileName", fileName);
        formData.append("department", department);
        if (subDepartment) {
          formData.append("subDepartment", subDepartment);
        }
        if (reportNotes) {
          formData.append("notes", reportNotes);
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
    <Dialog open={open} onClose={onClose} aria-labelledby="upload-dialog-title">
      <DialogTitle id="upload-dialog-title">Upload Report</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            type="file"
            onChange={handleFileChange}
            inputProps={{ accept: "application/pdf" }}
          />
          <TextField
            label="Notes"
            multiline
            rows={4}
            value={reportNotes}
            onChange={(e) => setReportNotes(e.target.value)}
            variant="outlined"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancel</Button>
        <Button onClick={handleUpload} color="primary" disabled={!file || loading}>
          {loading ? <CircularProgress size={24} /> : "Upload"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportUploadDialog;