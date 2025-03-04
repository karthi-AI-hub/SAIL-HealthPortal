import React, { useState, useEffect } from "react";
import { useEmployee } from "../../context/EmployeeContext";
import {
  Box,
  Tabs,
  Tab,
  Divider,
  Grid,
  Typography,
  Card,
  CardContent,
  Skeleton,
  useTheme,
  useMediaQuery,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
} from "@mui/material";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Person, Group, Email, Phone, LocationOn, ErrorOutline } from "@mui/icons-material"; // Icons for better UX
import { motion } from "framer-motion";

const EmployeeProfile = () => {
  const { employeeId } = useEmployee();
  const [selectedTab, setSelectedTab] = useState("You");
  const [familyData, setFamilyData] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
        setEmployeeData(data);
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
  };

  const renderSkeleton = () => (
    <Grid container spacing={3}>
      {Array.from({ length: 6 }).map((_, index) => (
        <Grid item xs={12} key={index}>
          <Skeleton variant="rectangular" width="100%" height={60} />
        </Grid>
      ))}
    </Grid>
  );

  const renderProfileHeader = () => (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 3,
        borderRadius: "8px",
        boxShadow: 1,
        mb: 3,
        textAlign: "center",
        backgroundColor: "background.paper",
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
    </Card>
  );

  const renderEmployeeData = () => {
    const orderedKeys = ["Name", "EmployeeId", "Email", "Phone", "Address"]; // Define the desired order of keys
    return (
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: 1,
          mb: 3,
          backgroundColor: "background.paper",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            <Person sx={{ verticalAlign: "middle", mr: 1 }} />
            Personal Details
          </Typography>
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
                {Object.keys(employeeData)
                  .filter((key) => !orderedKeys.includes(key))
                  .map((key) => (
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
        </CardContent>
      </Card>
    );
  };

  const renderFamilyData = () => {
    const member = familyData.find((member) => member.id === selectedTab);
    const orderedKeys = ["Name", "Relation", "Age", "Email", "Phone", "Address"]; // Define the desired order of keys for family members
    return member ? (
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          p: 3,
          borderRadius: "8px",
          boxShadow: 1,
          mb: 3,
          backgroundColor: "background.paper",
        }}
      >
        <CardContent>
          <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
            <Group sx={{ verticalAlign: "middle", mr: 1 }} />
            Family Member Details
          </Typography>
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
                        {member[key] || "N/A"}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {Object.keys(member)
                  .filter((key) => !orderedKeys.includes(key) && key !== "id")
                  .map((key) => (
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
        </CardContent>
      </Card>
    ) : (
      <Typography variant="h6" color="textSecondary" textAlign="center">
        <ErrorOutline sx={{ verticalAlign: "middle", mr: 1 }} />
        No data found for the selected person.
      </Typography>
    );
  };

  return (
    <Box sx={{ maxWidth: "100%", p: isMobile ? 2 : 4 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
        sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, mb: 2 }}
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

      {loading ? (
        renderSkeleton()
      ) : error ? (
        <Typography variant="h6" color="error" textAlign="center">
          <ErrorOutline sx={{ verticalAlign: "middle", mr: 1 }} />
          {error}
        </Typography>
      ) : (
        <Box sx={{ mt: 3 }}>
          {selectedTab === "You" && renderProfileHeader()}
          {selectedTab === "You" ? renderEmployeeData() : renderFamilyData()}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeProfile;