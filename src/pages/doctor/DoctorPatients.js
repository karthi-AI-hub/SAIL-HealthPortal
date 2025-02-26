import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Skeleton,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import { Email, Phone, Visibility, Edit, Description, UploadFile, Search, Person } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import EmployeeProfileView from "../../components/EmployeeProfileView";
import EmployeeProfileEdit from "../../components/EmployeeProfileEdit";
import { useDoctor } from "../../context/DoctorContext";

const DoctorPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [profileViewOpen, setProfileViewOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const db = getFirestore();
  const { doctorId } = useDoctor();
  const theme = useTheme();
  const location = useLocation();

  useEffect(() => {
    fetchPatients();
  }, [doctorId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const patientsRef = collection(db, "Employee");
      const snapshot = await getDocs(patientsRef);
      const patientsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPatients(patientsList);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfileView = (patientId) => {
    setSelectedPatientId(patientId);
    setProfileViewOpen(true);
  };

  const handleCloseProfileView = () => {
    setProfileViewOpen(false);
    setSelectedPatientId(null);
  };

  const handleOpenProfileEdit = (patientId) => {
    setSelectedPatientId(patientId);
    setProfileEditOpen(true);
  };

  const handleCloseProfileEdit = () => {
    setProfileEditOpen(false);
    setSelectedPatientId(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredPatients = patients.filter((patient) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.Name?.toLowerCase().includes(query) ||
      patient.EmployeeId?.toLowerCase().includes(query) ||
      patient.Email?.toLowerCase().includes(query) ||
      patient.Phone?.toLowerCase().includes(query)
    );
  });

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Patients List
      </Typography>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <TextField
          variant="outlined"
          placeholder="Search by Name, EmployeeId, Email, or Phone"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 1,
            boxShadow: theme.shadows[2],
            paddingLeft: 2,
          }}
        />
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column", borderRadius: 2 }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width="60%" height={30} />
                      <Skeleton variant="text" width="40%" height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {filteredPatients.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                textAlign: "center",
                color: theme.palette.text.secondary,
              }}
            >
              <Person sx={{ fontSize: 64, mb: 2 }} />
              <Typography variant="h6">No patients found</Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                Try adjusting your search or check back later.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredPatients.map((patient) => (
                <Grid item xs={12} sm={6} md={4} key={patient.id}>
                  <Card
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      transition: "transform 0.2s, box-shadow 0.2s",
                      borderRadius: 2,
                      boxShadow: theme.shadows[3],
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                        <Avatar
                          sx={{
                            width: 56,
                            height: 56,
                            mr: 2,
                            border: `2px solid ${theme.palette.primary.main}`,
                          }}
                          src={patient.ProfileImage || "/default-avatar.png"}
                          alt={patient.Name}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" fontWeight="bold" color="text.primary">
                            {patient.Name || "N/A"}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            {patient.EmployeeId || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                        <Email fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          {patient.Email || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                        <Phone fontSize="small" />
                        <Typography variant="body2" color="textSecondary">
                          {patient.Phone || "N/A"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                        <Tooltip title="View Profile">
                          <IconButton onClick={() => handleOpenProfileView(patient.id)} sx={{ color: theme.palette.primary.main }}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Profile">
                          <IconButton onClick={() => handleOpenProfileEdit(patient.id)} sx={{ color: theme.palette.secondary.main }}>
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View Reports">
                          <IconButton sx={{ color: theme.palette.warning.main }}>
                            <Description />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Upload Reports">
                          <IconButton sx={{ color: theme.palette.success.main }}>
                            <UploadFile />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      <EmployeeProfileView
        open={profileViewOpen}
        onClose={handleCloseProfileView}
        employeeId={selectedPatientId}
        onEdit={() => {
          handleCloseProfileView();
          handleOpenProfileEdit(selectedPatientId);
        }}
      />
      <EmployeeProfileEdit
        open={profileEditOpen}
        onClose={handleCloseProfileEdit}
        employeeId={selectedPatientId}
      />
    </Box>
  );
};

export default DoctorPatients;
