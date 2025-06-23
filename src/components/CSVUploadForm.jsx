import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";
import Papa from "papaparse";

export default function CSVUploadForm() {
  const [fileName, setFileName] = useState("");
  const { user } = useAuth();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const items = results.data;
        const promises = [];

        for (const item of items) {
          if (!item.name || !item.category || !item.quantity) continue;

          const newItem = {
            name: item.name,
            category: item.category,
            quantity: Number(item.quantity),
            unit: item.unit || "None",
            pricePerUnit: Number(item.pricePerUnit || 0),
            lowStockLimit: Number(item.lowStockLimit || 0),
            timestamp: serverTimestamp(),
          };

          promises.push(
            addDoc(collection(db, `users/${user.uid}/items`), newItem)
          );
        }

        try {
          await Promise.all(promises);
          toast.success("CSV items added successfully");
        } catch (error) {
          toast.error("Error uploading some items");
        }
      },
      error: () => {
        toast.error("Failed to parse CSV");
      },
    });
  };

  const handleDownloadSample = () => {
    const sampleData = [
      {
        name: "Milk",
        category: "Dairy",
        quantity: 3,
        unit: "Litres",
        pricePerUnit: 450,
        lowStockLimit: 1,
      },
      {
        name: "Sugar",
        category: "Groceries",
        quantity: 5,
        unit: "Kg",
        pricePerUnit: 1200,
        lowStockLimit: 2,
      },
    ];

    const csv = Papa.unparse(sampleData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_inventory.csv";
    link.click();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Upload Items from CSV
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        Ensure your CSV file includes the following headers:{" "}
        <strong>
          name, category, quantity, unit, pricePerUnit, lowStockLimit
        </strong>
      </Alert>

      <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleDownloadSample}>
          Download Sample CSV
        </Button>
        <Button component="label" variant="contained" startIcon={<UploadFileIcon />}>
          Upload CSV
          <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
        </Button>
        {fileName && (
          <Typography variant="body2" color="text.secondary">
            Selected: {fileName}
          </Typography>
        )}
      </Stack>
    </Box>
  );
}
