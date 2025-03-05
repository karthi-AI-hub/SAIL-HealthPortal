import React, { useState } from "react";
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
  Divider,
  Paper,
  Snackbar,
  Tabs,
  Tab,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  Search,
  MoreVert,
  FileDownload,
  Share,
  Person,
  Group,
  Upload,
  Add,
} from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import ReportUploadDialog from "../../Utils/ReportUploadDialog";
import AddFamilyMemberDialog from "../../components/AddFamilyMemberDialog";

const TechnicianDashboard = () => {
  const [patientId, setPatientId] = useState("");
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [reportTypeTab, setReportTypeTab] = useState("all");
  const [patientExists, setPatientExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [newFamilyMemberDialogOpen, setNewFamilyMemberDialogOpen] = useState(false);
  const [savingFamilyMember, setSavingFamilyMember] = useState(false);

  const checkPatientExists = async (patientId) => {
    try {
      const response = await fetch(`https://sail-backend.onrender.com/get-patient?patientId=${patientId}`);
      const data = await response.json();
      return data.exists;
    } catch (err) {
      console.error("Error checking patient existence:", err);
      throw err;
    }
  };

  const fetchFamilyData = async (patientId) => {
    try {
      const response = await fetch(`https://sail-backend.onrender.com/get-family?patientId=${patientId}`);
      const data = await response.json();
      setFamilyData(data.family);
      return data.family;
    } catch (err) {
      console.error("Error fetching family data:", err);
      setError("Failed to fetch family data.");
    }
  };

  const fetchReports = async (id) => {
    if (!id) {
      setError("Please enter a Patient ID.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getReports(id);
      setReports(data);
      filterReports(data, reportTypeTab);
    } catch (err) {
      console.error("Error fetching reports:", err);
            setReports([]);
      setFilteredReports([]);
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
        setSelectedTab("You");
        await fetchFamilyData(searchId);
        await fetchReports(searchId);
      } else {
        setError("Patient ID does not exist.");
        setFamilyData([]);
        setReports([]);
        setFilteredReports([]);
      }
    } catch (err) {
      console.error("Error during search:", err);
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
        selectedReport.expiryTime = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
      }

      saveAs(selectedReport.url, selectedReport.name);
      setSnackbarMessage("Report downloaded successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error downloading file:", error);
      setSnackbarMessage("Error downloading file: " + error.message);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  const handleShare = async () => {
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
        selectedReport.expiryTime = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
      }

      navigator.clipboard
        .writeText(selectedReport.url)
        .then(() => {
          setSnackbarMessage("Report URL copied to clipboard!");
          setSnackbarOpen(true);
        })
        .catch((err) => {
          console.error("Failed to copy URL:", err);
          setSnackbarMessage("Failed to copy URL: " + err.message);
          setSnackbarOpen(true);
        });
    } catch (error) {
      console.error("Error sharing file:", error);
      setSnackbarMessage("Error sharing file: " + error.message);
      setSnackbarOpen(true);
    }
    handleMenuClose();
  };

  const handleView = async (e, report) => {
    e.preventDefault();
    try {
      const isExpired = new Date() > new Date(report.expiryTime);
      if (isExpired) {
        const response = await fetch("https://sail-backend.onrender.com/regenerate-signed-url", {
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
        report.expiryTime = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
      }
      window.open(report.url, "_blank");
    } catch (error) {
      console.error("Error viewing file:", error);
      setSnackbarMessage("Error viewing file: " + error.message);
      setSnackbarOpen(true);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    fetchReports(newValue === "You" ? patientId : newValue);
  };

  const handleReportTypeTabChange = (event, newValue) => {
    setReportTypeTab(newValue);
    filterReports(reports, newValue);
  };

  const filterReports = (reports, reportType) => {
    if (reportType === "all") {
      setFilteredReports(reports);
    } else {
      setFilteredReports(reports.filter((report) => report.department === reportType));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const handleUploadDialogClose = (success, errorMessage) => {
    setUploadDialogOpen(false);
    if (success) {
      fetchReports(selectedTab === "You" ? patientId : selectedTab);
      setSnackbarMessage("Report uploaded successfully!");
      setSnackbarOpen(true);
    } else if (errorMessage) {
      setSnackbarMessage("Error uploading file: " + errorMessage);
      setSnackbarOpen(true);
    }
  };

  const handleAddFamilyMember = () => {
    setNewFamilyMemberDialogOpen(true);
    setSelectedTab("You");
  };

  const handleFamilyMemberDialogClose = () => {
    setNewFamilyMemberDialogOpen(false);
    setSelectedTab("You");
    fetchReports(patientId);
  };

  const handleFamilyMemberAdded = async () => {
    setSavingFamilyMember(true);
    await fetchFamilyData(patientId);
    setSelectedTab("You");
    fetchReports(patientId);
    setSavingFamilyMember(false);
  };

  return (
    <Box sx={{ p: 4 }}>
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
          <Button
            variant="contained"
            onClick={() => setUploadDialogOpen(true)}
            disabled={!patientExists || loading}
            startIcon={<Upload />}
            sx={{ height: 56 }}
          >
            Upload Report
          </Button>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        patientExists && (
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
              <Tab
                key="add"
                label={
                  <Tooltip title="Add new family member">
                    <IconButton onClick={handleAddFamilyMember} color="primary">
                      <Add />
                    </IconButton>
                  </Tooltip>
                }
                value="add"
                sx={{ textTransform: "capitalize" }}
              />
            </Tabs>
            <Divider sx={{ my: 2 }} />

            <Tabs
              value={reportTypeTab}
              onChange={handleReportTypeTabChange}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              sx={{ mb: 2 }}
            >
              <Tab label="All" value="all" />
              <Tab label="Blood" value="BLOOD" />
              <Tab label="Sugar" value="SUGAR" />
              <Tab label="Bp" value="BP" />
              <Tab label="ECG" value="ECG" />
              <Tab label="SCAN" value="SCAN" />
              <Tab label="X-ray" value="X-RAY" />
              <Tab label="Others" value="OTHERS" />
            </Tabs>

            {filteredReports.length === 0 ? (
              <Box sx={{ width: "100%", textAlign: "center", mt: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No reports found for the selected category.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {filteredReports.map((report) => (
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
                                onClick={(e) => handleView(e, report)}
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
        )
      )}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDownload}>
          <FileDownload sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />

      <ReportUploadDialog
        open={uploadDialogOpen}
        onClose={handleUploadDialogClose}
        patientId={selectedTab === "You" ? patientId : selectedTab}
        department={reportTypeTab === "all" ? "OTHERS" : reportTypeTab}
      />

      <AddFamilyMemberDialog
        open={newFamilyMemberDialogOpen}
        onClose={handleFamilyMemberDialogClose}
        employeeId={patientId}
        onFamilyMemberAdded={handleFamilyMemberAdded}
        saving={savingFamilyMember}
      />
      {savingFamilyMember && (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );
};

export default TechnicianDashboard;