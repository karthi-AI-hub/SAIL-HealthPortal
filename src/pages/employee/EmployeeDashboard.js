import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  IconButton,
  Tabs,
  Tab,
  Divider,
  Snackbar,
  Collapse,
  Chip,
} from "@mui/material";
import { FileDownload, Person, Group } from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { useEmployee } from "../../context/EmployeeContext";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { saveAs } from "file-saver";
import EmptyState from "../../components/EmptyState";

const EmployeeDashboard = () => {
  const { employeeId } = useEmployee();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [reportTypeTab, setReportTypeTab] = useState("all");
  const [subTab, setSubTab] = useState("Hematology");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [sortOrder, setSortOrder] = useState("latest");
  const db = getFirestore();

  useEffect(() => {
    if (employeeId) {
      fetchFamilyData();
      fetchReports(employeeId);
    }
  }, [employeeId]);

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

  const fetchReports = async (patientId) => {
    setLoading(true);
    setError("");
    try {
      const data = await getReports(patientId);
      setReports(data);
      filterReports(data, reportTypeTab);
    } catch (err) {
      setError(err.message);
      setReports([]);
      setFilteredReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (event) => {
    setSortOrder(event.target.value);
    const sortedReports = [...filteredReports].sort((a, b) => {
      if (event.target.value === "latest") {
        return new Date(b.uploadDate) - new Date(a.uploadDate);
      } else {
        return new Date(a.uploadDate) - new Date(b.uploadDate);
      }
    });
    setFilteredReports(sortedReports);
  };
  
  const handleDownload = async (report) => {
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

      saveAs(report.url, report.name);
      setSnackbarMessage("Report downloaded successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage("Error downloading file: " + error.message);
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
    fetchReports(newValue === "You" ? employeeId : newValue);
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
    if (reportType === "all") {
      setFilteredReports(reports.filter((report) => report.department !== "DELETED"));
    } else if (reportType === "LAB" && subtype) {
      setFilteredReports(reports.filter((r) => r.subDepartment === subtype));
    } else if (reportType === "PHARMACY" && subtype) {
      setFilteredReports(reports.filter((r) => r.subDepartment === subtype));
    } else {
      setFilteredReports(reports.filter((report) => report.department === reportType));
    }
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
          Medical Reports
        </Typography>
        <Typography variant="subtitle1">
          View and download reports for you and your family members.
        </Typography>
      </Box>

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

      {employeeId && (
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
            <Grid container spacing={3}>
              {filteredReports.map((report) => (
                <Grid item xs={12} sm={6} md={4} key={report.name}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      boxShadow: 3,
                      transition: "transform 0.2s, box-shadow 0.2s",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: 6,
                      },
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
                                report.expiryTime = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(); // Update expiry time to 6 months
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
                        <IconButton onClick={() => handleDownload(report)}>
                          <FileDownload />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
      />
    </Box>
  );
};

export default EmployeeDashboard;