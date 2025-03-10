import React from "react";
import { Box, Typography, Button, Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { LockOutlined } from "@mui/icons-material";

const AccessDenied = () => {
  const navigate = useNavigate();

  const handleLoginRedirect = () => {
    navigate("/");
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "#ffffff",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            bgcolor: "#ffffff",
            boxShadow: 6,
            borderRadius: 2,
            p: 4,
            transition: "box-shadow 0.3s ease-in-out",
            "&:hover": {
              boxShadow: 24,
            },
          }}
        >
          <LockOutlined sx={{ fontSize: 60, color: "error.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body1" gutterBottom>
            You no longer have access to this page. Please try logging in again.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoginRedirect}
            sx={{ mt: 3 }}
          >
            Go to Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AccessDenied;