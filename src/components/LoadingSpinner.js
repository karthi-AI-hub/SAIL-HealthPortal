import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

const LoadingSpinner = () => {
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
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Loading...
        </Typography>
      </Box>
    </Box>
  );
};

export default LoadingSpinner;