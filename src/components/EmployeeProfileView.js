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
  Snackbar,
  Alert,
} from "@mui/material";
import { getFirestore, doc, onSnapshot, collection } from "firebase/firestore";
import { Email, Phone, LocationOn, Person, Group, ErrorOutline, Close, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";

const EmployeeProfileView = ({ open, onClose, employeeId, onEdit }) => {
  const [employeeData, setEmployeeData] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();

  useEffect(() => {
    if (employeeId) {
      const unsubscribeEmployee = onSnapshot(doc(db, "Employee", employeeId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          delete data.LastLogin;
          delete data.CreatedAt;
          setEmployeeData(data);
          setLoading(false);
        } else {
          setError("No data found for the employee.");
          setLoading(false);
        }
      }, (err) => {
        setError("Failed to fetch employee data. Please try again later.");
        setLoading(false);
      });

      const unsubscribeFamily = onSnapshot(collection(db, "Employee", employeeId, "Family"), (snapshot) => {
        const familyList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setFamilyData(familyList);
      }, (err) => {
        setError("Failed to fetch family data. Please try again later.");
      });

      return () => {
        unsubscribeEmployee();
        unsubscribeFamily();
      };
    }
  }, [employeeId, db]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
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
        {employeeData?.EmployeeID || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Chip icon={<Email />} label={employeeData?.Email || "N/A"} variant="outlined" />
        <Chip icon={<Phone />} label={employeeData?.Phone || "N/A"} variant="outlined" />
        <Chip icon={<LocationOn />} label={employeeData?.Address || "N/A"} variant="outlined" />
      </Box>
    </Box>
  );

  const renderEmployeeData = () => {
    const orderedKeys = ["Name", "EmployeeID", "Email", "Phone", "Address"];
    const otherKeys = Object.keys(employeeData || {}).filter(
      (key) => !orderedKeys.includes(key)
    );

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
                  <Typography variant="body1" color="textSecondary">
                    {employeeData[key] || "N/A"}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
            {otherKeys.map((key) => (
              <TableRow key={key}>
                <TableCell>
                  <Typography variant="subtitle1" fontWeight="bold" color="primary">
                    {key.replace(/_/g, " ")}:
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body1" color="textSecondary">
                    {employeeData[key] || "N/A"}
                  </Typography>
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
    const orderedKeys = ["Name", "Relation", "Age", "Email", "Phone"];
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
                  <Typography variant="body1" color="textSecondary">
                    {member[key] || "N/A"}
                  </Typography>
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
        Employee Profile
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
                    Employee
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
        <Button onClick={onEdit} color="primary" startIcon={<Edit />}>
          Edit
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeeProfileView;