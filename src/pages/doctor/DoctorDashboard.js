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
  Paper,
  Snackbar,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import {
  Search,
  MoreVert,
  FileDownload,
  Share,
  Person,
  Group,
  Clear,
  Archive,
} from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useLocation } from "react-router-dom";

const DoctorDashboard = () => {
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdFromUrl = params.get("patientId");
    if (patientIdFromUrl) {
      setPatientId(patientIdFromUrl);
      handleSearch(patientIdFromUrl);
    }
  }, [location.search]);

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

  const handleArchive = async () => {
      try {
        const response = await fetch("https://sail-backend.onrender.com/archive-report", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: selectedReport.name }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to archive report");
        }
  
        setReports(reports.filter((report) => report.name !== selectedReport.name));
        setFilteredReports(filteredReports.filter((report) => report.name !== selectedReport.name));
        setSnackbarMessage("Report archived successfully!");
        setSnackbarOpen(true);
      } catch (error) {
        console.error("Error archiving report:", error);
        setSnackbarMessage("Error archiving report: " + error.message);
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
      setFilteredReports(reports.filter((report) => report.department !== "ARCHIVED"));
    } else {
      setFilteredReports(reports.filter((report) => report.department === reportType));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

 const handleClearSearch = () => {
    setPatientId("");
    setReports([]);
    setFamilyData([]);
    setPatientExists(false);
    setError("");
  };

  const renderTabs = () => (
    <Tabs
      value={selectedTab}
      onChange={handleTabChange}
      variant="scrollable"
      scrollButtons="auto"
      allowScrollButtonsMobile
      sx={{ 
        mb: 2,
        "& .MuiTabs-scrollButtons": {
          color: theme.palette.primary.main,
        },
      }}
    >
      <Tab
        label={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Person sx={{ mr: 1, fontSize: "1.2rem" }} />
            <Typography variant="body2">Employee</Typography>
          </Box>
        }
        value="You"
        sx={{ minHeight: 48, py: 0.5 }}
      />
      {familyData.map((member) => (
        <Tab
          key={member.id}
          label={
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Group sx={{ mr: 1, fontSize: "1.2rem" }} />
              <Typography variant="body2">{member.Relation}</Typography>
            </Box>
          }
          value={member.id}
          sx={{ minHeight: 48, py: 0.5 }}
        />
      ))}
  </Tabs>
);

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3, md: 4 },
      maxWidth: 1440,
      margin: '0 auto'
    }}>
      <Paper elevation={2} sx={{ 
        p: { xs: 2, sm: 3 },
        mb: 4,
        borderRadius: 4,
        background: theme.palette.background.paper,
      }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8} md={9}>
            <TextField
              fullWidth
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
                endAdornment: patientId && (
                  <IconButton onClick={handleClearSearch} size="small">
                    <Clear fontSize="small" />
                  </IconButton>
                ),
                sx: {
                  borderRadius: 50,
                  height: 48,
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4} md={3}>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => handleSearch()}
                  disabled={!patientId || loading}
                  startIcon={!isMobile && <Search />}
                  sx={{ 
                    height: 48,
                    borderRadius: 50,
                    textTransform: 'none'
                  }}
                >
                  {isMobile ? <Search /> : 'Search'}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress size={isMobile ? 32 : 40} />
        </Box>
      ) : patientExists ? (
        <>
          <Box sx={{ position: 'relative', mb: 4 }}>
            {renderTabs()}
          </Box>

          <Tabs
            value={reportTypeTab}
            onChange={handleReportTypeTabChange}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              mb: 3,
              '& .MuiTab-root': {
                minWidth: 'unset',
                px: 2,
                mx: 0.5,
                borderRadius: 50,
                bgcolor: 'action.hover',
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText'
                }
              }
            }}
          >
            {['all', 'BLOOD', 'SUGAR', 'BP', 'ECG', 'SCAN', 'X-RAY', 'OTHERS', 'ARCHIVED'].map((type) => (
              <Tab
                key={type}
                label={type === 'all' ? 'All' : type}
                value={type}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Tabs>

          {filteredReports.length === 0 ? (
            <EmptyState 
              title="No Reports Found"
              description="Try uploading a report or selecting a different category"
              icon="description"
            />
          ) : (
            <Grid container spacing={2}>
              {filteredReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={report.name}>
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        boxShadow: 1,
                        '&:hover': {
                          boxShadow: 4,
                        }
                      }}
                    >
                      <CardContent sx={{ flex: 1 }}>
                        <Box sx={{ 
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start'
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="subtitle1"
                              component="a"
                              onClick={(e) => handleView(e, report)}
                              sx={{
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'block',
                                mb: 1,
                                textDecoration: 'none',
                                color: 'text.primary',
                                '&:hover': {
                                  color: 'primary.main',
                                }
                              }}
                            >
                              {report.name}
                            </Typography>
                             <Typography variant="body2" color="text.secondary">
                               File Size : {report.size} KB
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                               Uploaded  : {report.uploadDate}
                            </Typography>
                            <Chip
                              label={report.department}
                              size="small"
                              sx={{ 
                                mt: 2,
                                bgcolor: 'primary.light',
                                color: 'primary.contrastText'
                              }}
                            />
                          </Box>
                          <IconButton 
                            onClick={(event) => handleMenuOpen(event, report)}
                            sx={{ ml: 1 }}
                          >
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
      ) : null}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDownload}>
          <FileDownload sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleShare}>
          <Share sx={{ mr: 1 }} /> Share
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <Archive sx={{ mr: 1 }} /> Archive
        </MenuItem>
      </Menu>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{
          vertical: isMobile ? 'bottom' : 'top',
          horizontal: 'center'
        }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: 3,
          }
        }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default DoctorDashboard;