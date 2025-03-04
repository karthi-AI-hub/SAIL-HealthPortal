import React, { useState, useEffect } from "react";
import { useTechnician } from "../../context/TechnicianContext";
import TechnicianProfileEdit from "../../components/TechnicianProfileEdit";
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
import { Person, Email, Phone, ErrorOutline, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";

const ProfileSkeleton = () => (
  <Grid container spacing={3}>
    {Array.from({ length: 6 }).map((_, index) => (
      <Grid item xs={12} key={index}>
        <Skeleton variant="rectangular" width="100%" height={60} />
      </Grid>
    ))}
  </Grid>
);

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

const ProfileHeader = ({ technicianData, onEditClick }) => {
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
        src={technicianData?.ProfileImage || "/default-avatar.png"}
        alt={technicianData?.Name}
      >
        {technicianData?.Name?.charAt(0) || "T"}
      </Avatar>
      <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
        {technicianData?.Name || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Chip
          icon={<Email />}
          label={technicianData?.Email || "N/A"}
          variant="outlined"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "scale(1.05)",
            },
            transition: "background-color 0.3s, color 0.3s",
          }}
        />
        <Chip
          icon={<Phone />}
          label={technicianData?.Phone || "N/A"}
          variant="outlined"
          sx={{
            "&:hover": {
              backgroundColor: theme.palette.primary.main,
              color: "white",
              transform: "scale(1.05)",
            },
            transition: "background-color 0.3s, color 0.3s",
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        startIcon={<Edit />}
        onClick={onEditClick}
        sx={{ mt: 2 }}
      >
        Edit Profile
      </Button>
    </Card>
  );
};

const TechnicianDataTable = ({ technicianData }) => {
  const theme = useTheme();
  const orderedKeys = [
    "Name",
    "Email",
    "Phone",
  ];

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
              {orderedKeys.map((key) => (
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
                      {technicianData[key] || "N/A"}
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

const TechnicianProfile = () => {
  const { technicianId } = useTechnician();
  const [technicianData, setTechnicianData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });
  const db = getFirestore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (technicianId) {
      fetchTechnicianData();
    }
  }, [technicianId]);

  const fetchTechnicianData = async () => {
    setLoading(true);
    setError(null);
    try {
      const docRef = doc(db, "Technicians", technicianId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        delete data.LastLogin;
        delete data.CreatedAt;
        setTechnicianData(data);
      } else {
        setError("No data found for the technician.");
      }
    } catch (err) {
      setError("Failed to fetch technician data. Please try again later.");
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
        <ErrorComponent error={error} onRetry={fetchTechnicianData} />
      ) : (
        <Box sx={{ mt: 3 }}>
          <ProfileHeader technicianData={technicianData} onEditClick={handleEditClick} />
          <TechnicianDataTable technicianData={technicianData} />
        </Box>
      )}

      <TechnicianProfileEdit
        open={editMode}
        onClose={() => setEditMode(false)}
        technicianId={technicianId}
      />

      <Snackbar open={alert.open} autoHideDuration={6000} onClose={handleCloseAlert}>
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TechnicianProfile;