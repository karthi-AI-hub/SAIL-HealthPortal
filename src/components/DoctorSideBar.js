import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import logo from "../assets/icon.png";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  CalendarMonth,
  Description,
  LocalHospital,
  Person,
  Logout,
} from "@mui/icons-material";

const DoctorSidebar = ({ doctor, isOpen, onMenuClick, setOpen }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const profileMenuOpen = Boolean(anchorEl);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/auth/doctor/login");
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  const menuItems = [
    { text: "Dashboard", icon: <Home />, path: "/doctor/dashboard" },
    { text: "Profile", icon: <Person />, path: "/doctor/profile" },
    { text: "Reports", icon : <Description/>, path: "/doctor/reports"},
    { text: "Employee", icon: <LocalHospital />, path: "/doctor/employeeList" },
    // { text: "Appointments", icon: <CalendarMonth />, path: "/doctor/appointments" },
  ];

  return (
    <>
      <AppBar position="fixed" sx={{ bgcolor: "#002147" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setOpen(true)}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1, justifyContent: "center" }}>
            <img src={logo} alt="SAIL Logo" style={{ width: 40, height: 40, marginRight: 10 }} />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              SAIL Health Portal
            </Typography>
          </Box>

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            {doctor.profileImage ? (
              <Avatar src={doctor.profileImage} sx={{ width: 40, height: 40 }} />
            ) : (
              <Avatar sx={{ bgcolor: "#ffffff", color: "#002147", fontWeight: "bold", width: 40, height: 40 }}>
                {getInitials(doctor.Name)}
              </Avatar>
            )}
          </IconButton>

          <Menu anchorEl={anchorEl} open={profileMenuOpen} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled>
              <Typography variant="subtitle1" className="doctor-name">
                {doctor.Name || "Loading..."}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => navigate("/doctor/profile")}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={() => setLogoutDialog(true)}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={isOpen}
        onClose={() => setOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: 260,
            bgcolor: "#002147",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          },
        }}
      >
        <Box>
          <Toolbar sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
            {doctor.profileImage ? (
              <Avatar src={doctor.profileImage} sx={{ width: 60, height: 60, mb: 1 }} />
            ) : (
              <Avatar sx={{ bgcolor: "#29c8dd", color: "#", width: 60, height: 60, mb: 1 }}>
                {getInitials(doctor.Name)}
              </Avatar>
            )}
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>{doctor.Name || "Loading..."}</Typography>
            <Typography variant="body2" sx={{ color: "#B0BEC5" }}>{doctor.DoctorID || "Logging in..."}</Typography>
          </Toolbar>

          <Divider sx={{ bgcolor: "#FFD700", height: 2 }} />

          <List>
            {menuItems.map((item, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.path}
                  onClick={onMenuClick}
                  sx={{
                    color: "white",
                    "&.active": { bgcolor: "#0056b3", color: "#FFD700" },
                    "&:hover": { bgcolor: "#003366" },
                  }}
                >
                  <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ padding: "10px", mb: 2 }}>
          <Divider sx={{ bgcolor: "#FFD700" }} />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => setLogoutDialog(true)}
              sx={{ bgcolor: "#B22222", color: "white", mt: 1, "&:hover": { bgcolor: "#8B0000" } }}
            >
              <ListItemIcon sx={{ color: "white" }}>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </Box>
      </Drawer>

      <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
        <DialogTitle>Are you sure you want to logout?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setLogoutDialog(false)} color="primary">Cancel</Button>
          <Button onClick={handleLogout} color="error">Logout</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DoctorSidebar;