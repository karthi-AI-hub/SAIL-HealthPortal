import React from "react";
import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSideBar";
import { Box } from "@mui/material";

const EmployeeLayout = ({ employee }) => {
  return (
    <Box sx={{ display: "flex" }}>
      <EmployeeSidebar employee={employee} />

      <Box sx={{ flexGrow: 1, padding: "20px", marginTop: "64px", width: "100%" }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default EmployeeLayout;
