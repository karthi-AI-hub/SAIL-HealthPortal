import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography, CircularProgress } from '@mui/material';

const ReportUploadDialog = ({ open, onClose, onUpload }) => {
  const [reportName, setReportName] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (reportName && file) {
      setLoading(true);
      const currentDate = new Date().toLocaleDateString().replace(/\//g, '-');
      const fileNameWithExtension = `${reportName}_${currentDate}`; // Remove the file extension here
      try {
        await onUpload(fileNameWithExtension, file);
        setLoading(false);
        onClose(true); 
      } catch (error) {
        setLoading(false);
        onClose(false, error.message);
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