import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Typography,
  Divider, Box, IconButton, Button, useTheme, useMediaQuery
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/SpaceDashboard";
import AddBoxIcon from "@mui/icons-material/AddBox";
import CategoryIcon from "@mui/icons-material/Category";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import ListAltIcon from "@mui/icons-material/ListAlt";
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    // eslint-disable-next-line
    window.localStorage.clear();
    // sign out logic (if needed)
    navigate("/");
  };

  const menuItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/dashboard" },
    { text: "Add Item", icon: <AddBoxIcon />, path: "/add" },
    { text: "Manage Categories", icon: <CategoryIcon />, path: "/categories" },
    { text: 'Add Transaction', icon: <MonetizationOnIcon />, path: '/add-transaction' },
  ];

  const drawer = (
    <Box sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      background: "linear-gradient(135deg,#1976d2 80%,#42a5f5 100%)",
      boxShadow: 2,
    }}>
      {/* Header */}
      <Box sx={{
        p: 2,
        pl: 3,
        pr: 3,
        minHeight: 68,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.1)"
      }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 1,
            }}
          >
            <span style={{ fontSize: 24, color: "#fff" }}>🏠</span>
          </Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: "#fff",
              fontFamily: "Montserrat, sans-serif",
              letterSpacing: 1,
              fontSize: 22
            }}
            noWrap
          >
            Inventory
          </Typography>
        </Box>
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ color: "white", ml: 1 }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ backgroundColor: "rgba(255,255,255,0.16)" }} />

      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            key={item.text}
            component={NavLink}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mx: 1,
              my: 0.5,
              color: "#fff",
              "&.active, &:hover": {
                background: "rgba(255,255,255,0.12)",
                color: "#fff",
              },
              transition: "background 0.2s",
              fontWeight: "bold",
            }}
          >
            <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: "bold", fontSize: 16 }} />
          </ListItem>
        ))}

        <ListItem
          component={NavLink}
          to="/edit-profile"
          onClick={() => isMobile && setMobileOpen(false)}
          sx={{
            borderRadius: 2, mx: 1, my: 0.5,
            "&.active, &:hover": { backgroundColor: "rgba(255,255,255,0.10)" }
          }}
        >
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <PersonIcon />
          </ListItemIcon>
          <ListItemText primary="Edit Profile" />
        </ListItem>

        <ListItem
          component={NavLink}
          to="/transactions"
          onClick={() => isMobile && setMobileOpen(false)}
          sx={{
            borderRadius: 2, mx: 1, my: 0.5,
            "&.active, &:hover": { backgroundColor: "rgba(255,255,255,0.10)" }
          }}
        >
          <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Transactions" />
        </ListItem>
      </List>

      <Box sx={{ p: 2, pb: 3 }}>
        <Button
          variant="outlined"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: "#fff",
            borderColor: "#fff",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.14)",
              borderColor: "#fff"
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Hamburger Menu for Mobile */}
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 18,
            left: 16,
            zIndex: 2001,
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: "50%",
            boxShadow: 2,
            "&:hover": { backgroundColor: "#1565c0" },
            width: 44,
            height: 44
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          zIndex: isMobile ? 2002 : 1200,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            background: "linear-gradient(135deg,#1976d2 80%,#42a5f5 100%)",
            color: "#fff",
            border: 0,
            transition: "all .15s"
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Sidebar;
