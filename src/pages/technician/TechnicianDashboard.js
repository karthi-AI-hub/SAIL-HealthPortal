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
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Search,
  MoreVert,
  FileDownload,
  Share,
  Person,
  Group,
  Upload,
  Clear,
} from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { saveAs } from "file-saver";
import { motion } from "framer-motion";
import ReportUploadDialog from "../../Utils/ReportUploadDialog";
import EmptyState from "../../components/EmptyState";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useLocation } from "react-router-dom";
import { useTechnician } from "../../context/TechnicianContext";
import { format } from 'date-fns';

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
  const [subTab, setSubTab] = useState("Hematology");
  const [patientExists, setPatientExists] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState("latest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  const { technicianId } = useTechnician();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const patientIdFromUrl = params.get("employeeID");
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
      const sortedData = data.sort((a, b) => {
        if (sortOrder === "latest") {
          return new Date(b.uploadDate) - new Date(a.uploadDate);
        } else {
          return new Date(a.uploadDate) - new Date(b.uploadDate);
        }
      });
      setReports(sortedData);
      filterReports(sortedData, reportTypeTab);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    const sortedReports = [...reports].sort((a, b) => {
      if (event.target.value === "latest") {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      }
    });
    setReports(sortedReports);
    filterReports(sortedReports, reportTypeTab);
  };

  const handleSearch = async (id) => {
    const searchId = id || patientId;
    if (!searchId) {
      setError("Please enter a Employee ID.");
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
        setError("Employee ID does not exist.");
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

  // const handleArchive = async () => {
  //   try {
  //     const response = await fetch("https://sail-backend.onrender.com/archive-report", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ name: selectedReport.name }),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to archive report");
  //     }

  //     setReports(reports.filter((report) => report.name !== selectedReport.name));
  //     setFilteredReports(filteredReports.filter((report) => report.name !== selectedReport.name));
  //     setSnackbarMessage("Report archived successfully!");
  //     setSnackbarOpen(true);
  //   } catch (error) {
  //     console.error("Error archiving report:", error);
  //     setSnackbarMessage("Error archiving report: " + error.message);
  //     setSnackbarOpen(true);
  //   }
  //   handleMenuClose();
  // };

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
    if (newValue === "LAB") {
      setSubTab("Hematology");
    } else if (newValue === "PHARMACY") {
      setSubTab("InPharmacy");
    }
    fetchReports(newValue === "You" ? patientId : newValue);
    filterReports(reports, newValue, newValue === "LAB" ? "Hematology" : newValue === "PHARMACY" ? "InPharmacy" : null);
  };

  const handleSubTabChange = (event, newValue) => {
    setSubTab(newValue);
    filterReports(reports, reportTypeTab, newValue);
  };

  const handleReportTypeTabChange = (event, newValue) => {
    setReportTypeTab(newValue);
    if (newValue === "LAB") {
      setSubTab("Hematology");
    } else if (newValue === "PHARMACY") {
      setSubTab("InPharmacy");
    }
    filterReports(reports, newValue, newValue === "LAB" ? "Hematology" : newValue === "PHARMACY" ? "InPharmacy" : null);
  };

  const filterReports = (reports, reportType, subtype) => {
    let filtered = [];
    if (reportType === "all") {
      filtered = reports.filter((report) => report.department !== "DELETED");
    } else if (reportType === "LAB" && subtype) {
      filtered = reports.filter((r) => r.subDepartment === subtype);
    } else if (reportType === "PHARMACY" && subtype) {
      filtered = reports.filter((r) => r.subDepartment === subtype);
    } else {
      filtered = reports.filter((report) => report.department === reportType);
    }
  
    setFilteredReports(filtered);
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

  const handleClearSearch = () => {
    setPatientId("");
    setReports([]);
    setFamilyData([]);
    setPatientExists(false);
    setError("");
  };

  const handleDelete = async () => {
    if (!deleteReason) {
      setSnackbarMessage("Please provide a reason for deleting the report.");
      setSnackbarOpen(true);
      return;
    }
  
    setDeleteLoading(true);
    try {
      if (!technicianId) {
        throw new Error("Technician ID not found");
      }

      const timestamp = new Date().toISOString();

      const response = await fetch("https://sail-backend.onrender.com/delete-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedReport.name,
          technicianId,
          timestamp,
          reason: deleteReason,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete report");
      }

      setReports(reports.filter((report) => report.name !== selectedReport.name));
      setFilteredReports(filteredReports.filter((report) => report.name !== selectedReport.name));
      setSnackbarMessage("Report deleted successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting report:", error);
      setSnackbarMessage("Error deleting report: " + error.message);
      setSnackbarOpen(true);
    } finally {
      setDeleteLoading(false);
    }
    handleMenuClose();
    setDeleteDialogOpen(false);
  };

  // const renderSkeletons () => (
  //   <Grid container spacing={3}>
  //     {[1, 2, 3].map((item) => (
  //       <Grid item xs={12} sm={6} md={4} key={item}>
  //         <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
  //       </Grid>
  //     ))}
  //   </Grid>
  // );

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
              autoFocus
              fullWidth
              variant="outlined"
              placeholder="Enter Employee ID"
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
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => setUploadDialogOpen(true)}
                  disabled={!patientExists || loading}
                  startIcon={!isMobile && <Upload />}
                  sx={{ 
                    height: 48,
                    borderRadius: 50,
                    textTransform: 'none'
                  }}
                >
                  {isMobile ? <Upload /> : 'Upload'}
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
              mb: 1,
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
            {['all', 'LAB', 'ECG', 'SCAN', 'XRAY', 'PHARMACY', 'OTHERS'].map((type) => (
              <Tab
                key={type}
                label={type === 'all' ? 'All' : type}
                value={type}
                sx={{ textTransform: 'capitalize' }}
              />
            ))}
          </Tabs>

          {reportTypeTab === "LAB" && (
  <Collapse in={reportTypeTab === "LAB"} timeout="auto" unmountOnExit>
    <Box sx={{ mt: 1, p: 1}}>
      <Tabs
        value={subTab}
        onChange={handleSubTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
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
        {["Hematology", "Biochemistry", "Microbiology", "Bloodbank"].map((sub) => (
          <Tab key={sub} label={sub} value={sub} />
        ))}
      </Tabs>
    </Box>
  </Collapse>
)}

{reportTypeTab === "PHARMACY" && (
  <Collapse in={reportTypeTab === "PHARMACY"} timeout="auto" unmountOnExit>
    <Box sx={{ mt: 1, p: 1 }}>
      <Tabs
        value={subTab}
        onChange={handleSubTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
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
        {["InPharmacy", "OutPharmacy"].map((sub) => (
          <Tab key={sub} label={sub} value={sub} />
        ))}
      </Tabs>
    </Box>
  </Collapse>
)}
          {filteredReports.length === 0 ? (
            <EmptyState 
              title="No Reports Found"
              description="Try uploading a report or selecting a different category"
              icon="description"
            />
          ) : (
             
<TableContainer sx={{ mt: 5 }} component={Paper}>
  {/* <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
    <FormControl variant="outlined" size="small">
      <InputLabel>Sort By</InputLabel>
      <Select
        value={sortOrder}
        onChange={handleSortChange}
        label="Sort By"
      >
        <MenuItem value="latest">Latest First</MenuItem>
        <MenuItem value="oldest">Oldest First</MenuItem>
      </Select>
    </FormControl>
  </Box> */}
  <Table sx={{ minWidth: 650 }} aria-label="simple table">
    <TableHead>
      <TableRow>
        <TableCell>Report Name</TableCell>
        <TableCell align="center">Uploaded On</TableCell>
        <TableCell align="right">Actions</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {filteredReports.map((report) => (
        <TableRow
          key={report.name}
          sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
        >
          <TableCell component="th" scope="row">
            <Typography
              variant="subtitle1"
              component="a"
              onClick={(e) => handleView(e, report)}
              sx={{
                cursor: "pointer",
                fontWeight: 600,
                display: "block",
                mb: 1,
                textDecoration: "none",
                color: "text.primary",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {report.name}
            </Typography>
          </TableCell>
          <TableCell align="center">{report.uploadDate}</TableCell>
          <TableCell align="right">
            <IconButton
              onClick={(event) => handleMenuOpen(event, report)}
              sx={{ ml: 1 }}
            >
              <MoreVert />
            </IconButton>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
          //   <Grid container spacing={2}>
          //     {filteredReports.map((report) => (
          //       <Grid item xs={12} sm={6} md={4} lg={3} key={report.name}>
          //         <motion.div 
          //           whileHover={{ scale: 1.02 }}
          //           whileTap={{ scale: 0.98 }}
          //         >
          //           <Card
          //             sx={{
          //               height: '100%',
          //               display: 'flex',
          //               flexDirection: 'column',
          //               borderRadius: 3,
          //               boxShadow: 1,
          //               '&:hover': {
          //                 boxShadow: 4,
          //               }
          //             }}
          //           >
          //             <CardContent sx={{ flex: 1 }}>
          //               <Box sx={{ 
          //                 display: 'flex',
          //                 justifyContent: 'space-between',
          //                 alignItems: 'flex-start'
          //               }}>
          //                 <Box sx={{ flex: 1 }}>
          //                   <Typography
          //                     variant="subtitle1"
          //                     component="a"
          //                     onClick={(e) => handleView(e, report)}
          //                     sx={{
          //                       cursor: 'pointer',
          //                       fontWeight: 600,
          //                       display: 'block',
          //                       mb: 1,
          //                       textDecoration: 'none',
          //                       color: 'text.primary',
          //                       '&:hover': {
          //                         color: 'primary.main',
          //                       }
          //                     }}
          //                   >
          //                     {report.name}
          //                   </Typography>
                           
          //                   <Typography variant="body2" color="text.secondary">
          //                      Uploaded  : {report.uploadDate}
          //                   </Typography>
          //                   {report.notes ? (
          //                    <Typography variant="body2" color="text.secondary">
          //                      Notes : {report.notes}
          //                   </Typography>
          //                   ) : (
          //                     <Typography variant="body2" color="text.secondary">
          //                      &nbsp;
          //                   </Typography>
          //                   )}
          //                   <Chip
          //                     label={report.department}
          //                     size="small"
          //                     sx={{ 
          //                       mt: 2,
          //                       bgcolor: 'primary.light',
          //                       color: 'primary.contrastText'
          //                     }}
          //                   />
          //                 </Box>
          //                 <IconButton 
          //                   onClick={(event) => handleMenuOpen(event, report)}
          //                   sx={{ ml: 1 }}
          //                 >
          //                   <MoreVert />
          //                 </IconButton>
          //               </Box>
          //             </CardContent>
          //           </Card>
          //         </motion.div>
          //       </Grid>
          //     ))}
          //   </Grid>
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
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color : 'red'}}>
          <Clear sx={{ mr: 1 }} /> Delete
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
  subDepartment={reportTypeTab === "LAB" ? subTab : reportTypeTab === "PHARMACY" ? subTab : null}
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

      <Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  aria-labelledby="delete-dialog-title"
  aria-describedby="delete-dialog-description"
>
  <DialogTitle id="delete-dialog-title">Delete Report</DialogTitle>
  <DialogContent>
    <DialogContentText id="delete-dialog-description">
      Please provide a reason for deleting this report:
    </DialogContentText>
    <TextField
      autoFocus
      margin="dense"
      id="deleteReason"
      label="Reason"
      type="text"
      fullWidth
      variant="standard"
      value={deleteReason}
      onChange={(e) => setDeleteReason(e.target.value)}
      disabled={deleteLoading}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleteLoading}>Cancel</Button>
    <Button onClick={handleDelete} color="error" disabled={deleteLoading || !deleteReason}>
      {deleteLoading ? <CircularProgress size={24} /> : "Delete"}
    </Button>
  </DialogActions>
</Dialog>

    </Box>
  );
};

export default TechnicianDashboard;