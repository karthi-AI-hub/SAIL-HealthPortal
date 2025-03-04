import React, { useState, useEffect } from "react";
import { useDoctor } from "../../context/DoctorContext";
import {
  Box,
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
  Divider,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Person, Email, Phone, LocationOn, ErrorOutline, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";
import DoctorProfileEdit from "../../components/DoctorProfileEdit";

// Reusable Skeleton Loader
const ProfileSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} key={index}>
        <Skeleton variant="rectangular" width="100%" height={60} />
      </Grid>
    ))}
  </Grid>
);

// Reusable Error Component
const ErrorComponent = ({ error, onRetry }) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 300,
        textAlign: "center",
      }}
    >
      <ErrorOutline sx={{ fontSize: 64, color: theme.palette.error.main, mb: 2 }} />
      <Typography variant="h6" color="error">
        {error}
      </Typography>
      <Button variant="contained" color="primary" onClick={onRetry} sx={{ mt: 2 }}>
        Retry
      </Button>
    </Box>
  );
};

// Reusable Profile Header
const ProfileHeader = ({ doctorData, onEditClick }) => {
  const theme = useTheme();
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 3,
        borderRadius: "8px",
        boxShadow: 3,
        mb: 3,
        textAlign: "center",
        backgroundColor: "background.paper",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s, box-shadow 0.3s",
        },
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
          "&:hover": {
            backgroundColor: theme.palette.primary.dark,
            transition: "background-color 0.3s",
          },
        }}
        src={doctorData?.ProfileImage || "/default-avatar.png"}
        alt={doctorData?.Name}
      >
        {doctorData?.Name?.charAt(0) || "D"}
      </Avatar>
      <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
        {doctorData?.Name || "N/A"}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {doctorData?.DoctorID || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Chip
          icon={<Email />}
          label={doctorData?.Email || "N/A"}
          variant="outlined"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "scale(1.05)",
            },
            transition: "background-color 0.3s, color 0.3s, transform 0.2s",
          }}
        />
        <Chip
          icon={<Phone />}
          label={doctorData?.Phone || "N/A"}
          variant="outlined"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "scale(1.05)",
            },
            transition: "background-color 0.3s, color 0.3s, transform 0.2s",
          }}
        />
        <Chip
          icon={<LocationOn />}
          label={doctorData?.Address || "N/A"}
          variant="outlined"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "scale(1.05)",
            },
            transition: "background-color 0.3s, color 0.3s, transform 0.2s",
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Edit />}
        sx={{ mt: 2 }}
        onClick={onEditClick}
      >
        Edit Profile
      </Button>
    </Card>
  );
};

// Reusable Doctor Data Table
const DoctorDataTable = ({ doctorData }) => {
  const theme = useTheme();
  const keys = Object.keys(doctorData || {});
  return (
    <Card
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        p: 3,
        borderRadius: "8px",
        boxShadow: 3,
        mb: 3,
        backgroundColor: "background.paper",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
          transition: "transform 0.3s, box-shadow 0.3s",
        },
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
              {keys.map((key) => (
                <TableRow
                  key={key}
                  sx={{
                    "&:hover": {
                      backgroundColor: theme.palette.action.hover,
                      transform: "scale(1.02)",
                    },
                    transition: "background-color 0.3s, transform 0.2s",
                  }}
                >
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight="bold" color="primary">
                      {key.replace(/_/g, " ").replace(/\b\w/g, char => char.toUpperCase())}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="textSecondary">
                      {doctorData[key] || "N/A"}
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

// Main Component
const DoctorProfile = () => {
  const { doctorId } = useDoctor();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const db = getFirestore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (doctorId) {
      fetchDoctorData();
    }
  }, [doctorId]);

  const fetchDoctorData = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "Doctors", doctorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        delete data.LastLogin;
        delete data.CreatedAt;
        setDoctorData(data);
      } else {
        setError("No data found for the doctor.");
      }
    } catch (err) {
      setError("Failed to fetch doctor data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => setEditMode(true);
  const handleCloseAlert = () => setAlert({ ...alert, open: false });

  return (
    <Box sx={{ maxWidth: "100%", p: isMobile ? 2 : 4 }}>
      <Divider sx={{ my: 2 }} />

      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <ErrorComponent error={error} onRetry={fetchDoctorData} />
      ) : (
        <Box sx={{ mt: 3 }}>
          <ProfileHeader doctorData={doctorData} onEditClick={handleEditClick} />
          <DoctorDataTable doctorData={doctorData} />
        </Box>
      )}

      <DoctorProfileEdit
        open={editMode}
        onClose={() => setEditMode(false)}
        doctorId={doctorId}
      />

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DoctorProfile;