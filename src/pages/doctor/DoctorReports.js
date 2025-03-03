import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Tabs,
  Tab,
  Divider,
  Paper,
  Snackbar,
  Fab,
} from "@mui/material";
import { Search, MoreVert, FileDownload, Share, Delete, Person, Group, UploadFile } from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { useLocation } from "react-router-dom";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { saveAs } from "file-saver";
import ReportUploadDialog from "../../Utils/ReportUploadDialog";
import { motion } from "framer-motion";

const DoctorReports = () => {
  const [patientId, setPatientId] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [patientExists, setPatientExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const location = useLocation();
  const db = getFirestore();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdFromUrl = params.get("patientId");
    if (patientIdFromUrl) {
      setPatientId(patientIdFromUrl);
      handleSearch(patientIdFromUrl);
    }
  }, [location.search]);

  const checkPatientExists = async (patientId) => {
    const patientDoc = doc(db, "Employee", patientId);
    const patientSnapshot = await getDoc(patientDoc);
    return patientSnapshot.exists();
  };

  const fetchFamilyData = async (patientId) => {
    try {
      const familyRef = collection(db, "Employee", patientId, "Family");
      const familySnapshot = await getDocs(familyRef);
      const familyList = familySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFamilyData(familyList);
    } catch (err) {
      setError("Failed to fetch family data. Please try again later.");
    }
  };

  const fetchReports = async (patientId) => {
    if (!patientId) {
      setError("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getReports(patientId);
      setReports(data);
    } catch (err) {
      setError("Error fetching reports: " + err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (id) => {
    const searchId = id || patientId;
    if (!searchId) {
      setError("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const exists = await checkPatientExists(searchId);
      setPatientExists(exists);

      if (exists) {
        await fetchFamilyData(searchId);
        await fetchReports(searchId);
      } else {
        setError("Patient ID does not exist.");
        setFamilyData([]);
        setReports([]);
      }
    } catch (err) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    const newPatientId = event.target.value;
    setPatientId(newPatientId);

    if (newPatientId !== patientId) {
      setReports([]);
      setFamilyData([]);
      setPatientExists(false);
      setError("");
    }
  };

  const handleMenuOpen = (event, report) => {
    setAnchorEl(event.currentTarget);
    setSelectedReport(report);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReport(null);
  };

  const handleDownload = async () => {
    try {
      const isExpired = new Date() > new Date(selectedReport.expiryTime);
  
      if (isExpired) {
        const response = await fetch("https://sail-backend.onrender.com/regenerate-signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: `${selectedReport.patientId}/${selectedReport.name}` }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to regenerate signed URL");
        }
  
        const { signedUrl } = await response.json();
        selectedReport.url = signedUrl;
        selectedReport.expiryTime = new Date(Date.now() + 3600 * 1000).toISOString(); // Update expiry time
      }
  
      saveAs(selectedReport.url, selectedReport.name);
      setSnackbarMessage("Report downloaded successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error downloading file: " + error.message);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  const handleShare = async () => {
    try {
      const isExpired = new Date() > new Date(selectedReport.expiryTime);
  
      if (isExpired) {
        const response = await fetch("https://sail-backend.onrender.com//regenerate-signed-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filePath: `${selectedReport.patientId}/${selectedReport.name}` }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to regenerate signed URL");
        }
  
        const { signedUrl } = await response.json();
        selectedReport.url = signedUrl;
        selectedReport.expiryTime = new Date(Date.now() + 3600 * 1000).toISOString(); 
      }
  
      navigator.clipboard
        .writeText(selectedReport.url)
        .then(() => {
          setSnackbarMessage("Report URL copied to clipboard!");
          setSnackbarOpen(true);
        })
        .catch((err) => {
          setSnackbarMessage("Failed to copy URL: " + err.message);
          setSnackbarOpen(true);
        });
    } catch (error) {
      setSnackbarMessage("Error sharing file: " + error.message);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  }; 

  const handleDelete = async () => {
    try {
      const response = await fetch("https://sail-backend.onrender.com/delete-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ filePath: `${selectedReport.patientId}/${selectedReport.name}` }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      setReports(reports.filter((report) => report.name !== selectedReport.name));
      setSnackbarMessage("Report deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error deleting file: " + error.message);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    fetchReports(newValue === "You" ? patientId : newValue);
  };

  const handleOpenUploadDialog = () => {
    if (patientExists) {
      setUploadDialogOpen(true);
    } else {
      setSnackbarMessage("Patient ID does not exist. Cannot upload report.");
      setSnackbarOpen(true);
    }
  };

  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };

  const handleUploadSuccess = () => {
    fetchReports(patientId);
    setSnackbarMessage("Report uploaded successfully!");
    setSnackbarOpen(true);
  };

    const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  return (
    <Box sx={{ p: 4 }}>
            <Box
        sx={{
          background: "linear-gradient(to right, #6a11cb, #2575fc)",
          color: "white",
          p: 4,
          borderRadius: 2,
          mb: 4,
          textAlign: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Patients Reports
        </Typography>
        <Typography variant="subtitle1">
          Manage and view reports for your Patients and their family members.
        </Typography>
      </Box>

            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Enter Patient ID"
            value={patientId}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: "100%",
              maxWidth: 600,
              borderRadius: 1,
              boxShadow: 2,
              paddingLeft: 2,
            }}
          />
          <Button
            variant="contained"
            onClick={() => handleSearch()}
            disabled={!patientId || loading}
            startIcon={<Search />}
            sx={{ height: 56 }}
          >
            Search
          </Button>
        </Box>
      </Paper>

            {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

            {patientExists && (
        <>
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

                    {reports.length === 0 ? (
            <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No reports found for the provided Patient ID.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {reports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.name}>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                    <Card
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: 3,
                        transition: "transform 0.2s, box-shadow 0.2s",
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box>
                            <Typography
                              variant="h6"
                              component="a"
                              href={report.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={async (e) => {
                                e.preventDefault();
                                const isExpired = new Date() > new Date(report.expiryTime);
                                if (isExpired) {
                                  const response = await fetch("http://localhost:3001/regenerate-signed-url", {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ filePath: `${report.patientId}/${report.name}` }),
                                  });
                      
                                  if (!response.ok) {
                                    throw new Error("Failed to regenerate signed URL");
                                  }
                      
                                  const { signedUrl } = await response.json();
                                  report.url = signedUrl;
                                  report.expiryTime = new Date(Date.now() + 3600 * 1000).toISOString(); // Update expiry time
                                }
                                window.open(report.url, "_blank");
                              }}
                            >
                              {report.name}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              File Size: {report.size} KB
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Uploaded: {report.uploadDate}
                            </Typography>
                          </Box>
                          <IconButton onClick={(event) => handleMenuOpen(event, report)}>
                            <MoreVert />
                          </IconButton>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Floating Action Button for Upload */}
      <Fab
        color="primary"
        aria-label="upload"
        onClick={handleOpenUploadDialog}
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        <UploadFile />
      </Fab>

      {/* Menu for Report Actions */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDownload}>
          <FileDownload sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Upload Report Dialog */}
      <ReportUploadDialog
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
        patientId={selectedTab === "You" ? patientId : selectedTab}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Snackbar for Feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default DoctorReports;