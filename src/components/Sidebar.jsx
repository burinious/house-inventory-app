import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Drawer, List, ListItem, ListItemIcon, ListItemText, Typography,
  Divider, Box, IconButton, Button, useTheme, useMediaQuery
} from "@mui/material";
import {
  faChartPie, faPlus, faTags, faRightFromBracket, faBars,
  faTimes, faUserEdit, faListCheck, faMoneyBillTrendUp
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const drawerWidth = 240;

const Sidebar = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    window.localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { text: "Dashboard", icon: faChartPie, path: "/dashboard" },
    { text: "Add Item", icon: faPlus, path: "/add" },
    { text: "Manage Categories", icon: faTags, path: "/categories" },
    { text: "Add Transaction", icon: faMoneyBillTrendUp, path: "/add-transaction" },
    { text: "Edit Profile", icon: faUserEdit, path: "/edit-profile" },
    { text: "Transactions", icon: faListCheck, path: "/transactions" },
  ];

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(14px)",
        background: "rgba(25, 118, 210, 0.75)",
        borderRight: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Box
        sx={{
          p: 3,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255,255,255,0.1)"
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="white" noWrap>
          <FontAwesomeIcon icon={faChartPie} style={{ marginRight: 8 }} />
          Inventory
        </Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)} sx={{ color: "#fff" }}>
            <FontAwesomeIcon icon={faTimes} />
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
              mx: 1,
              my: 0.5,
              borderRadius: 2,
              color: "#fff",
              "&.active, &:hover": {
                backgroundColor: "rgba(255,255,255,0.12)",
              }
            }}
          >
            <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
              <FontAwesomeIcon icon={item.icon} />
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>

      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FontAwesomeIcon icon={faRightFromBracket} />}
          onClick={handleLogout}
          sx={{
            color: "#fff",
            borderColor: "#fff",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)"
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
      {isMobile && !mobileOpen && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 16,
            left: 16,
            zIndex: 2000,
            backgroundColor: "#1976d2",
            color: "white",
            borderRadius: "50%",
            width: 46,
            height: 46,
            boxShadow: 2
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </IconButton>
      )}

      <Drawer
        variant={isMobile ? "temporary" : "permanent"}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "transparent",
            boxShadow: "none",
            border: 0
          }
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
