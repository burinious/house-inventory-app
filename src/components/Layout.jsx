import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { Box } from "@mui/material";

const Layout = () => {
  return (
    <>
      <Topbar />
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            paddingTop: { xs: "56px", sm: "64px" }, // Adjust for Topbar
            px: 2,
            height: "100vh",
            overflow: "hidden",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </>
  );
};

export default Layout;
