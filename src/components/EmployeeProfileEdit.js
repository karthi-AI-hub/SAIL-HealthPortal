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
  Tabs,
  Tab,
  Divider,
  Skeleton,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import { getFirestore, doc, getDoc, collection, getDocs, updateDoc, setDoc } from "firebase/firestore";
import { Email, Phone, LocationOn, Person, Group, ErrorOutline, Close, Save, Cancel, Add } from "@mui/icons-material";
import { motion } from "framer-motion";

const EmployeeProfileEdit = ({ open, onClose, employeeId }) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const [newFieldDialogOpen, setNewFieldDialogOpen] = useState(false);
  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldValue, setNewFieldValue] = useState("");
  const [newFamilyMemberDialogOpen, setNewFamilyMemberDialogOpen] = useState(false);
  const [newFamilyMemberData, setNewFamilyMemberData] = useState({ Name: "", Relation: "", Age: "", Email: "", Phone: "", Address: "" });
  const db = getFirestore();

  useEffect(() => {
    if (employeeId) {
      fetchEmployeeData();
      fetchFamilyData();
    }
  }, [employeeId]);

  const fetchEmployeeData = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "Employee", employeeId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        delete data.LastLogin;
        delete data.CreatedAt;
        delete data.Pass;
        setEmployeeData(data);
        setFormData(data);
      } else {
        setError("No data found for the employee.");
      }
    } catch (err) {
      setError("Failed to fetch employee data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const familyRef = collection(db, "Employee", employeeId, "Family");
      const familySnapshot = await getDocs(familyRef);
      const familyList = familySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFamilyData(familyList);
    } catch (err) {
      setError("Failed to fetch family data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    if (newValue === "You") {
      setFormData(employeeData);
    } else {
      const member = familyData.find((member) => member.id === newValue);
      setFormData(member);
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

  const handleAddFamilyMember = () => {
    setNewFamilyMemberDialogOpen(true);
  };

  const handleSaveFamilyMember = async () => {
    try {
      const familyRef = collection(db, "Employee", employeeId, "Family");
      let relationCount = 1;
      let newMemberId = `${employeeId}_${newFamilyMemberData.Relation}`;

      while (true) {
        const docRef = doc(familyRef, newMemberId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          break;
        }
        relationCount++;
        newMemberId = `${employeeId}_${newFamilyMemberData.Relation}${relationCount}`;
      }

      await setDoc(doc(familyRef, newMemberId), newFamilyMemberData);
      fetchFamilyData();
      setNewFamilyMemberDialogOpen(false);
      setNewFamilyMemberData({ Name: "", Relation: "", Age: "", Email: "", Phone: "", Address: "" });
      setAlert({ open: true, message: "Family member added successfully!", severity: "success" });
    } catch (err) {
      setError("Failed to add family member. Please try again later.");
      setAlert({ open: true, message: "Failed to add family member.", severity: "error" });
    }
  };

  const handleSave = async () => {
    try {
      if (selectedTab === "You") {
        const docRef = doc(db, "Employee", employeeId);
        await updateDoc(docRef, formData);
        setEmployeeData(formData);
      } else {
        const docRef = doc(db, "Employee", employeeId, "Family", selectedTab);
        await updateDoc(docRef, formData);
        const updatedFamilyData = familyData.map((member) =>
          member.id === selectedTab ? formData : member
        );
        setFamilyData(updatedFamilyData);
      }
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
        src={employeeData?.ProfileImage || "/default-avatar.png"}
        alt={employeeData?.Name}
      >
        {employeeData?.Name?.charAt(0) || "U"}
      </Avatar>
      <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
        {employeeData?.Name || "N/A"}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {employeeData?.EmployeeId || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Chip icon={<Email />} label={employeeData?.Email || "N/A"} variant="outlined" />
        <Chip icon={<Phone />} label={employeeData?.Phone || "N/A"} variant="outlined" />
        <Chip icon={<LocationOn />} label={employeeData?.Address || "N/A"} variant="outlined" />
      </Box>
    </Box>
  );

  const renderEmployeeData = () => {
    const orderedKeys = ["Name", "EmployeeId", "Email", "Phone", "Address"];
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
                    disabled={key === "Email" || key === "EmployeeId"}
                  />
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(formData).filter(key => !orderedKeys.includes(key)).map((key, index) => (
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const renderFamilyData = () => {
    const member = familyData.find((member) => member.id === selectedTab);
    const orderedKeys = ["Name", "Relation", "Age", "Email", "Phone", "Address"];
    return member ? (
      <TableContainer component={Paper} elevation={0} sx={{ mt: 2 }}>
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
                  />
                </TableCell>
              </TableRow>
            ))}
            {Object.keys(formData).filter(key => !orderedKeys.includes(key)).map((key, index) => (
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography variant="h6" color="textSecondary" textAlign="center">
        <ErrorOutline sx={{ verticalAlign: "middle", mr: 1 }} />
        No data found for the selected person.
      </Typography>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Edit Employee Profile
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
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              sx={{ mb: 2 }}
            >
              <Tab
                key="You"
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Person sx={{ mr: 1 }} />
                    You
                  </Box>
                }
                value="You"
                sx={{ textTransform: "capitalize" }}
              />
              {familyData.map((member) => (
                <Tab
                  key={member.id}
                  label={
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Group sx={{ mr: 1 }} />
                      {member.Relation}
                    </Box>
                  }
                  value={member.id}
                  sx={{ textTransform: "capitalize" }}
                />
              ))}
            </Tabs>
            <Divider sx={{ my: 2 }} />
            {selectedTab === "You" ? renderEmployeeData() : renderFamilyData()}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Tooltip title="Add new field">
          <IconButton onClick={handleAddField} color="primary">
            <Add />
          </IconButton>
        </Tooltip>
        <Tooltip title="Add new family member">
          <IconButton onClick={handleAddFamilyMember} color="primary">
            <Group />
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
      <Dialog open={newFamilyMemberDialogOpen} onClose={() => setNewFamilyMemberDialogOpen(false)}>
        <DialogTitle>Add New Family Member</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={newFamilyMemberData.Name}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Name: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Relation"
            value={newFamilyMemberData.Relation}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Relation: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Age"
            value={newFamilyMemberData.Age}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Age: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Email"
            value={newFamilyMemberData.Email}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Email: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Phone"
            value={newFamilyMemberData.Phone}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Phone: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
          <TextField
            label="Address"
            value={newFamilyMemberData.Address}
            onChange={(e) => setNewFamilyMemberData({ ...newFamilyMemberData, Address: e.target.value })}
            fullWidth
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewFamilyMemberDialogOpen(false)} color="secondary">
            Cancel
          </Button>
          <Button onClick={handleSaveFamilyMember} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default EmployeeProfileEdit;