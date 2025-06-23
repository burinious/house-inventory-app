import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  MenuItem,
  Typography,
  Paper,
  Stack,
  CircularProgress,
} from "@mui/material";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { toast } from "react-toastify";

const unitOptions = [
  "None",
  "Packs",
  "Bottles",
  "Litres",
  "Kg",
  "Grams",
  "Cups",
  "Plates",
  "Boxes",
  "Bowls",
  "Cartons",
  "Units",
];

export default function SingleItemForm() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "None",
    pricePerUnit: "",
    lowStockLimit: "",
  });

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${user.uid}/categories`)
        );
        const cats = querySnapshot.docs.map((doc) => doc.data().name);
        setCategories(cats);
      } catch (error) {
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    if (user?.uid) {
      fetchCategories();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.quantity) {
      toast.error("Please fill in name, category and quantity");
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/items`), {
        ...form,
        quantity: Number(form.quantity),
        pricePerUnit: Number(form.pricePerUnit),
        lowStockLimit: Number(form.lowStockLimit),
        timestamp: serverTimestamp(),
      });

      toast.success("Item added successfully");
      setForm({
        name: "",
        category: "",
        quantity: "",
        unit: "None",
        pricePerUnit: "",
        lowStockLimit: "",
      });
    } catch (error) {
      toast.error("Failed to add item");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Add a Single Item
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
        <Stack spacing={2}>
          <TextField
            label="Item Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />

          {loadingCategories ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <TextField
              select
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              fullWidth
            >
              {categories.length === 0 ? (
                <MenuItem disabled>No categories found</MenuItem>
              ) : (
                categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat}
                  </MenuItem>
                ))
              )}
            </TextField>
          )}

          <TextField
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
            required
            fullWidth
          />

          <TextField
            select
            label="Quantity Unit"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            fullWidth
          >
            {unitOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Price per Unit (₦)"
            name="pricePerUnit"
            type="number"
            value={form.pricePerUnit}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Low Stock Limit"
            name="lowStockLimit"
            type="number"
            value={form.lowStockLimit}
            onChange={handleChange}
            fullWidth
          />

          <Button type="submit" variant="contained" size="large">
            Add Item
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
}
