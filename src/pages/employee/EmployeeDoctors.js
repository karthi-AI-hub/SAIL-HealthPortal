import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Avatar,
  InputAdornment,
  CircularProgress,
  Skeleton,
  Alert,
  useTheme,
  Tooltip,
  CardActionArea,
} from "@mui/material";
import { Search as SearchIcon, Email, Phone, Schedule } from "@mui/icons-material";
import BookAppointment from "../../components/BookAppointment";
import { useEmployee } from "../../context/EmployeeContext";

const EmployeeDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [openAppointmentModal, setOpenAppointmentModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();
  const { employeeId } = useEmployee();
  const theme = useTheme();

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const doctorsRef = collection(db, "Doctors");
      const snapshot = await getDocs(doctorsRef);
      const doctorsList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setDoctors(doctorsList);
    } catch (error) {
      console.error("Error fetching doctors:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    (doctor.Name && doctor.Name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doctor.Specialization && doctor.Specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleBookAppointment = (doctor) => {
    setSelectedDoctor(doctor);
    setOpenAppointmentModal(true);
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
        Doctors List
      </Typography>

      {/* Search Bar */}
      <TextField
        fullWidth
        placeholder="Search by name or specialization"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 3,
          borderRadius: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            boxShadow: theme.shadows[1],
          },
          "& .MuiInputAdornment-root svg": {
            color: theme.palette.text.secondary,
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Loading State - Skeletons */}
      {loading ? (
        <Grid container spacing={3}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ display: "flex", alignItems: "center", p: 2, borderRadius: 3 }}>
                <Skeleton variant="circular" width={56} height={56} sx={{ mr: 2 }} />
                <CardContent sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={30} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                  <Skeleton variant="text" width="50%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          {/* Empty State */}
          {filteredDoctors.length === 0 ? (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              No doctors found matching your search.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Render Doctors */}
              {filteredDoctors.map((doctor) => (
                <Grid item xs={12} md={6} key={doctor.id}>
                  <Card
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 3,
                      borderRadius: 3,
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-6px)",
                        boxShadow: theme.shadows[6],
                      },
                    }}
                  >
                    <CardActionArea>
                      <Avatar
                        sx={{
                          width: 72,
                          height: 72,
                          mr: 2,
                          border: `2px solid ${theme.palette.primary.main}`,
                          objectFit: "cover",
                        }}
                        src={doctor.ProfileImage || "/default-avatar.png"}
                        alt={doctor.Name}
                      />
                      <CardContent sx={{ flex: 1 }}>
                        <Typography variant="h6" fontWeight="bold" color="text.primary">
                          {doctor.Name || "N/A"}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {doctor.Specialization || "N/A"}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                          <Email fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.Email || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                          <Phone fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.ContactInfo || "N/A"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                          <Schedule fontSize="small" />
                          <Typography variant="body2" color="text.secondary">
                            {doctor.Availability || "N/A"}
                          </Typography>
                        </Box>

                        <Tooltip title="Book Appointment" arrow>
                          <Button
                            variant="contained"
                            color="primary"
                            sx={{
                              mt: 2,
                              boxShadow: theme.shadows[2],
                              "&:hover": {
                                boxShadow: theme.shadows[4],
                              },
                            }}
                            onClick={() => handleBookAppointment(doctor)}
                          >
                            Book Appointment
                          </Button>
                        </Tooltip>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Appointment Modal */}
      {selectedDoctor && (
        <BookAppointment
          open={openAppointmentModal}
          onClose={() => setOpenAppointmentModal(false)}
          doctor={selectedDoctor}
          employeeId={employeeId}
        />
      )}
    </Box>
  );
};

export default EmployeeDoctors;
