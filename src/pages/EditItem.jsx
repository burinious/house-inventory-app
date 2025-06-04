import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container, TextField, Button, Typography, MenuItem, Box
} from "@mui/material";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    quantity: "",
    pricePerUnit: "",
    lowStockLimit: 5, // <--- add this default!
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch item data by ID
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const docRef = doc(db, "users", user.uid, "items", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            name: data.name || "",
            category: data.category || "",
            quantity: data.quantity || "",
            pricePerUnit: data.pricePerUnit || "",
            lowStockLimit: data.lowStockLimit || 5, // <--- grab from Firestore, fallback to 5
          });
        } else {
          toast.error("Item not found");
          navigate("/dashboard");
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load item");
      }
    };

    if (user) fetchItem();
  }, [id, user, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "users", user.uid, "categories")
        );
        const data = snapshot.docs.map((doc) => doc.data().name);
        setCategories(data);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    if (user) fetchCategories();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const { name, category, quantity, pricePerUnit, lowStockLimit } = formData;

    if (!name || !category || !quantity || !pricePerUnit) {
      return toast.error("All fields are required");
    }

    setLoading(true);
    try {
      const docRef = doc(db, "users", user.uid, "items", id);
      await updateDoc(docRef, {
        name,
        category,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
        lowStockLimit: lowStockLimit === "" ? 5 : Number(lowStockLimit),

      });
      toast.success("Item updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4} mb={2}>
        Edit Item
      </Typography>
      <form onSubmit={handleUpdate}>
        <TextField
          fullWidth
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          select
          fullWidth
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          margin="normal"
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
          value={formData.quantity}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Price Per Unit (₦)"
          name="pricePerUnit"
          type="number"
          value={formData.pricePerUnit}
          onChange={handleChange}
          margin="normal"
          required
        />
        {/* LOW STOCK LIMIT FIELD */}
        <TextField
          fullWidth
          label="Low Stock Limit"
          name="lowStockLimit"
          type="number"
          inputProps={{ min: 0 }}
          value={formData.lowStockLimit}
          onChange={handleChange}
          margin="normal"
          required
          helperText="Set the quantity where a warning should show (default: 5)"
        />
        <Box mt={2}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Item"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default EditItem;
