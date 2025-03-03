import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Card, CardContent, CircularProgress, Alert, IconButton, Tabs, Tab, Divider, Snackbar } from "@mui/material";
import { FileDownload, Person, Group } from "@mui/icons-material";
import { getReports } from "../../Utils/getReports";
import { useEmployee } from "../../context/EmployeeContext";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { saveAs } from "file-saver";

const EmployeeReports = () => {
  const { employeeId } = useEmployee();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [familyData, setFamilyData] = useState([]);
  const [selectedTab, setSelectedTab] = useState("You");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
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
    } catch (err) {
      setError("Error fetching reports: " + err.message);
      setReports([]);
    } finally {
      setLoading(false);
    }
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
    fetchReports(newValue === "You" ? employeeId : newValue);
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

export default EmployeeReports;
