import React from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";

const Topbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { userData } = useAuth();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        backdropFilter: "blur(14px)",
        background: "rgba(255, 255, 255, 0.4)",
        borderBottom: "1px solid rgba(255,255,255,0.2)",
        zIndex: 1101,
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", px: 2 }}>
        {/* Left Section (Logo or Title) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar
            src={userData?.logo || ""}
            alt={userData?.name || "User"}
            sx={{ width: 40, height: 40 }}
          >
            {userData?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          {!isMobile && (
            <Box>
              <Typography variant="subtitle2" color="primary" fontWeight="bold">
                {userData?.name || "User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Welcome back!
              </Typography>
            </Box>
          )}
        </Box>

        {/* Right Section (Actions) */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton>
            <FontAwesomeIcon icon={faBell} />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
