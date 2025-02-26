import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Box,
  Divider,
  Skeleton,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { Email, Phone, LocationOn, Close, Save, Cancel, Add, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const DoctorProfileEdit = ({ open, onClose, doctorId }) => {
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [newFieldDialogOpen, setNewFieldDialogOpen] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const db = getFirestore();

  useEffect(() => {
    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId]);

  const fetchDoctorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "Doctors", doctorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        delete data.LastLogin;
        delete data.CreatedAt;
        delete data.Pass;
        setDoctorData(data);
        setFormData(data);
      } else {
        setError("No data found for the doctor.");
      }
    } catch (err) {
      setError("Failed to fetch doctor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddField = () => {
    setNewFieldDialogOpen(true);
  };

  const handleSaveField = () => {
    if (newFieldKey && newFieldValue) {
      setFormData({ ...formData, [newFieldKey]: newFieldValue });
      setNewFieldDialogOpen(false);
      setNewFieldKey("");
      setNewFieldValue("");
    }
  };

  const handleDeleteField = (key) => {
    const updatedData = { ...formData };
    delete updatedData[key];
    setFormData(updatedData);
  };

  const handleSave = async () => {
    try {
      const docRef = doc(db, "Doctors", doctorId);
      await updateDoc(docRef, formData);
      setDoctorData(formData);
      onClose();
      setAlert({ open: true, message: "Data saved successfully!", severity: "success" });
    } catch (err) {
      setError("Failed to update data. Please try again later.");
      setAlert({ open: true, message: "Failed to save data.", severity: "error" });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  const renderSkeleton = () => (
    <Box>
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
      ))}
    </Box>
  );

  const renderProfileHeader = () => (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        textAlign: "center",
        mb: 3,
      }}
    >
      <Avatar
        sx={{
          width: 100,
          height: 100,
          margin: "auto",
          mb: 2,
          bgcolor: "primary.main",
          color: "white",
          fontSize: "2.5rem",
        }}
        src={doctorData?.ProfileImage || "/default-avatar.png"}
        alt={doctorData?.Name}
      >
        {doctorData?.Name?.charAt(0) || "D"}
      </Avatar>
      <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
        {doctorData?.Name || "N/A"}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {doctorData?.DoctorID || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Chip icon={<Email />} label={doctorData?.Email || "N/A"} variant="outlined" />
        <Chip icon={<Phone />} label={doctorData?.Phone || "N/A"} variant="outlined" />
        <Chip icon={<LocationOn />} label={doctorData?.Address || "N/A"} variant="outlined" />
      </Box>
    </Box>
  );

  const renderDoctorData = () => {
    const orderedKeys = ["Name", "DoctorID", "Email", "Phone", "Address", "Specialization"];
    return (
      <TableContainer component={Paper} elevation={0}>
        <Table>
          <TableBody>
            {orderedKeys.map((key) => (
              <TableRow key={key}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {key.replace(/_/g, " ")}:
                  </Typography>
                </TableCell>
                <TableCell>
                  <TextField
                    name={key}
                    value={formData[key] || ""}
                    onChange={handleInputChange}
                    fullWidth
                    variant="outlined"
                    size="small"
                    disabled={key === "Email" || key === "DoctorID"}
                  />
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(formData)
              .filter((key) => !orderedKeys.includes(key))
              .map((key, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {key.replace(/_/g, " ")}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <TextField
                      name={key}
                      value={formData[key] || ""}
                      onChange={handleInputChange}
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <Tooltip title="Delete Field">
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleDeleteField(key)}
                        sx={{ mt: 1 }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Doctor Profile
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {loading ? (
          renderSkeleton()
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            {renderProfileHeader()}
            <Divider sx={{ my: 2 }} />
            {renderDoctorData()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Tooltip title="Add new field">
          <IconButton onClick={handleAddField} color="primary">
            <Add />
          </IconButton>
        </Tooltip>
        <Button onClick={handleSave} color="primary" startIcon={<Save />}>
          Save
        </Button>
        <Button onClick={onClose} color="secondary" startIcon={<Cancel />}>
          Cancel
        </Button>
      </DialogActions>
      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Dialog open={newFieldDialogOpen} onClose={() => setNewFieldDialogOpen(false)}>
        <DialogTitle>Add New Field</DialogTitle>
        <DialogContent>
          <TextField
            label="Key"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Value"
            value={newFieldValue}
            onChange={(e) => setNewFieldValue(e.target.value)}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFieldDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveField} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default DoctorProfileEdit;