// src/components/Layout.js

import React from 'react';
import { Box, Toolbar } from '@mui/material';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: { xs: 8, md: 3 } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
