// src/components/Topbar.jsx
import React from 'react';
import {
  AppBar, Toolbar, Typography, Button, Avatar,
  Box, useMediaQuery, useTheme
} from '@mui/material';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const Topbar = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out!");
      navigate('/');
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  return (
    <AppBar position="sticky" elevation={3} sx={{ backgroundColor: '#1976d2' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={userData?.logo || ""}
            alt="Store Logo"
            sx={{
              width: 36, height: 36,
              bgcolor: '#1565c0',
              fontWeight: 'bold',
              fontSize: 16
            }}
          >
            {userData?.name?.[0]?.toUpperCase() || 'U'}
          </Avatar>
          <Typography variant={isMobile ? 'subtitle1' : 'h6'} fontWeight="bold" noWrap>
            🏠 {userData?.name || 'House Inventory'}
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="inherit"
          onClick={handleLogout}
          size={isMobile ? 'small' : 'medium'}
          sx={{
            borderColor: '#fff',
            color: '#fff',
            fontWeight: 500,
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: '#fff',
            },
          }}
        >
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
