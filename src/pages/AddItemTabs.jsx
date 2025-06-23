// AddItemTabs.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import SingleItemForm from "../components/SingleItemForm";
import BulkManualForm from "../components/BulkManualForm";
import CSVUploadForm from "../components/CSVUploadForm";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AddItemTabs = () => {
  const [tab, setTab] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  return (
    <Box sx={{ bgcolor: "#f4f8fb", minHeight: "100vh", py: 6 }}>
      <Paper
        elevation={4}
        sx={{ maxWidth: 800, width: "100%", mx: "auto", p: 3, borderRadius: 3 }}
      >
        <Stack spacing={2} alignItems="center" mb={3}>
          <AddBoxIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h5" fontWeight="bold">
            Add Inventory Items
          </Typography>
        </Stack>
        <Tabs
          value={tab}
          onChange={handleChange}
          variant="fullWidth"
          sx={{ mb: 3 }}
        >
          <Tab label="Single Entry" />
          <Tab label="Bulk Entry" />
          <Tab label="CSV Upload" />
        </Tabs>
        {tab === 0 && <SingleItemForm user={user} />}
        {tab === 1 && <BulkManualForm user={user} />}
        {tab === 2 && <CSVUploadForm user={user} />}
      </Paper>
    </Box>
  );
};

export default AddItemTabs;

// --- SingleItemForm.jsx ---
// Reuse your original form code here and export it as a separate component

// --- BulkManualForm.jsx ---
// A dynamic form where users can add/remove multiple items before submitting

// --- CSVUploadForm.jsx ---
// A file uploader with PapaParse to preview and submit multiple entries

// I’ll now generate these components with Firebase submission included.
