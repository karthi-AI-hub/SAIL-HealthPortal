import React, { useState, useEffect } from "react";
import { useEmployee } from "../../context/EmployeeContext";
import {
  Box,
  Tabs,
  Tab,
  Divider,
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
  Button,	
  IconButton,
  Tooltip,
} from "@mui/material";
import { getFirestore, doc, onSnapshot, collection } from "firebase/firestore";
import { Person, Group, Email, Phone, LocationOn, ErrorOutline, Refresh } from "@mui/icons-material";
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

const ProfileHeader = ({ employeeData }) => {
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
        src={employeeData?.ProfileImage || "/default-avatar.png"}
        alt={employeeData?.Name}
      >
        {employeeData?.Name?.charAt(0) || "U"}
      </Avatar>
      <Typography variant="h4" fontWeight="bold" color="textPrimary" gutterBottom>
        {employeeData?.Name || "N/A"}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        {employeeData?.EmployeeID || "N/A"}
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2, flexWrap: "wrap" }}>
        <Chip
          icon={<Email />}
          label={employeeData?.Email || "N/A"}
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
          label={employeeData?.Phone || "N/A"}
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
          icon={<LocationOn />}
          label={employeeData?.Address || "N/A"}
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
    </Card>
  );
};

const EmployeeDataTable = ({ employeeData }) => {
  const theme = useTheme();
  const orderedKeys = ["Name", "EmployeeID", "Email", "Phone"];
  const otherKeys = Object.keys(employeeData || {}).filter(
    (key) => !orderedKeys.includes(key)
  );

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
                      {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="textSecondary">
                      {employeeData[key] || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {otherKeys.map((key) => (
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
                      {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="textSecondary">
                      {employeeData[key] || "N/A"}
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

const FamilyDataTable = ({ familyData, selectedTab }) => {
  const theme = useTheme();
  const member = familyData.find((member) => member.id === selectedTab);
  const orderedKeys = ["Name", "Relation", "Age", "Email", "Phone", "Address"];
  const otherKeys = Object.keys(member || {}).filter(
    (key) => !orderedKeys.includes(key) && key !== "id"
  );

  return member ? (
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
          <Group sx={{ verticalAlign: "middle", mr: 1 }} />
          Family Member Details
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
                      {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="textSecondary">
                      {member[key] || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
              {otherKeys.map((key) => (
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
                      {key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}:
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" color="textSecondary">
                      {member[key] || "N/A"}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  ) : (
    <Typography variant="h6" color="textSecondary" textAlign="center">
      <ErrorOutline sx={{ verticalAlign: "middle", mr: 1 }} />
      No data found for the selected person.
    </Typography>
  );
};

const EmployeeProfile = () => {
  const { employeeId } = useEmployee();
  const [selectedTab, setSelectedTab] = useState("You");
  const [familyData, setFamilyData] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const db = getFirestore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    if (employeeId) {
      const unsubscribeEmployee = onSnapshot(
        doc(db, "Employee", employeeId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            delete data.LastLogin;
            delete data.CreatedAt;
            delete data.ConditionHistory;
            delete data.Condition;
            setEmployeeData(data);
            setError(null);
          } else {
            setError("No data found for the employee.");
          }
          setLoading(false);
        },
        (err) => {
          setError("Failed to fetch employee data. Please try again later.");
          setLoading(false);
        }
      );

      const unsubscribeFamily = onSnapshot(
        collection(db, "Employee", employeeId, "Family"),
        (snapshot) => {
          const familyList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFamilyData(familyList);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError("Failed to fetch family data. Please try again later.");
          setLoading(false);
        }
      );

      return () => {
        unsubscribeEmployee();
        unsubscribeFamily();
      };
    }
  }, [employeeId]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    if (employeeId) {
      const unsubscribeEmployee = onSnapshot(
        doc(db, "Employee", employeeId),
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            delete data.LastLogin;
            delete data.CreatedAt;
            delete data.ConditionHistory;
            delete data.Condition;
            setEmployeeData(data);
            setError(null);
          } else {
            setError("No data found for the employee.");
          }
          setLoading(false);
        },
        (err) => {
          setError("Failed to fetch employee data. Please try again later.");
          setLoading(false);
        }
      );

      const unsubscribeFamily = onSnapshot(
        collection(db, "Employee", employeeId, "Family"),
        (snapshot) => {
          const familyList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFamilyData(familyList);
          setError(null);
          setLoading(false);
        },
        (err) => {
          setError("Failed to fetch family data. Please try again later.");
          setLoading(false);
        }
      );

      return () => {
        unsubscribeEmployee();
        unsubscribeFamily();
      };
    }
  };

  return (
    <Box sx={{ maxWidth: "100%", p: isMobile ? 2 : 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h4" fontWeight="bold">
          Employee Profile
        </Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>
      <Divider sx={{ my: 2 }} />

      {loading ? (
        <ProfileSkeleton />
      ) : error ? (
        <ErrorComponent error={error} onRetry={handleRefresh} />
      ) : (
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{ position: "sticky", top: 0, background: "white", zIndex: 1, mb: 2 }}
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

          {selectedTab === "You" && <ProfileHeader employeeData={employeeData} />}
          {selectedTab === "You" ? (
            <EmployeeDataTable employeeData={employeeData} />
          ) : (
            <FamilyDataTable familyData={familyData} selectedTab={selectedTab} />
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmployeeProfile;