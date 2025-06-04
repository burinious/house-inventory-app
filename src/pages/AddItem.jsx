import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box,
  Paper,
  Stack,
} from "@mui/material";
import AddBoxIcon from "@mui/icons-material/AddBox";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const AddItem = () => {
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    pricePerUnit: "",
    lowStockLimit: 5,
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "categories")
        );
        const categoryList = snapshot.docs.map((doc) => doc.data().name);
        setCategories(categoryList);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, quantity, pricePerUnit, lowStockLimit } = formData;
    if (!name || !category || !quantity || !pricePerUnit) {
      toast.error("All fields are required!");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "users", user.uid, "items"), {
        name,
        category,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
        lowStockLimit: lowStockLimit === "" ? 5 : Number(lowStockLimit),

        createdAt: serverTimestamp(),
      });
      toast.success("Item added successfully!");
      setFormData({
        name: "",
        category: "",
        quantity: "",
        pricePerUnit: "",
        lowStockLimit: 5,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Box sx={{
      bgcolor: "#f4f8fb",
      minHeight: "100vh",
      py: 6,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <Paper
        elevation={4}
        sx={{
          maxWidth: 430,
          width: "100%",
          p: { xs: 2, sm: 4 },
          mx: 2,
          borderRadius: 3,
          boxShadow: "0 6px 24px 0 rgba(80,90,170,.15)"
        }}
      >
        <Stack spacing={2} alignItems="center" mb={2}>
          <AddBoxIcon sx={{ fontSize: 40, color: "primary.main" }} />
          <Typography variant="h5" fontWeight="bold">
            Add New Item
          </Typography>
        </Stack>

        {categories.length === 0 ? (
          <Box textAlign="center">
            <Typography color="error" mb={2}>
              Please add at least one category before adding items.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/categories")}
              sx={{ mt: 2 }}
            >
              Manage Categories
            </Button>
          </Box>
        ) : (
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Item Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoFocus
                required
              />
              <TextField
                select
                fullWidth
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                {categories.map((cat, index) => (
                  <MenuItem key={index} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.quantity}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Price Per Unit (₦)"
                name="pricePerUnit"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.pricePerUnit}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Low Stock Limit"
                name="lowStockLimit"
                type="number"
                inputProps={{ min: 0 }}
                value={formData.lowStockLimit}
                onChange={handleChange}
                helperText="Set the quantity where a warning should show (default: 5)"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                fullWidth
                startIcon={<AddBoxIcon />}
                sx={{ fontWeight: "bold", fontSize: 17 }}
              >
                {loading ? "Adding..." : "Add Item"}
              </Button>
            </Stack>
          </form>
        )}
      </Paper>
    </Box>
  );
};

export default AddItem;
