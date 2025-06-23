import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AddCircle, RemoveCircle } from "@mui/icons-material";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { toast } from "react-toastify";

const unitOptions = [
  "None", "Pieces", "Packs", "Boxes", "Bottles", "Litres",
  "Kg", "Grams", "Cartons", "Bowls", "Cups", "Sachets", "Others",
];

export default function BulkManualForm() {
  const [items, setItems] = useState([
    { name: "", category: "", quantity: "", unit: "None", pricePerUnit: "", lowStockLimit: "" },
  ]);
  const [categories, setCategories] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCategories = async () => {
      if (!user) return;
      const snap = await getDocs(collection(db, `users/${user.uid}/categories`));
      const categoryList = snap.docs.map(doc => doc.data().name);
      setCategories(categoryList);
    };

    fetchCategories();
  }, [user]);

  const handleChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };

  const handleAddRow = () => {
    setItems([
      ...items,
      { name: "", category: "", quantity: "", unit: "None", pricePerUnit: "", lowStockLimit: "" },
    ]);
  };

  const handleRemoveRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const promises = items.map(async (item) => {
      if (!item.name || !item.category || !item.quantity) return;

      const newItem = {
        ...item,
        quantity: Number(item.quantity),
        pricePerUnit: Number(item.pricePerUnit || 0),
        lowStockLimit: Number(item.lowStockLimit || 0),
        timestamp: serverTimestamp(),
      };

      return addDoc(collection(db, `users/${user.uid}/items`), newItem);
    });

    try {
      await Promise.all(promises);
      toast.success("Items added successfully");
      setItems([{ name: "", category: "", quantity: "", unit: "None", pricePerUnit: "", lowStockLimit: "" }]);
    } catch {
      toast.error("Failed to add some items");
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Bulk Add Items Manually
      </Typography>

      {items.map((item, index) => (
        <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Name"
              name="name"
              value={item.name}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={6} sm={2}>
  <TextField
    select
    label="Category"
    name="category"
    value={item.category}
    onChange={(e) => handleChange(index, e)}
    fullWidth
    required
    size="small"
    InputLabelProps={{ shrink: true }} // Ensures full label is always shown
  >
    {/* Placeholder option */}
    <MenuItem value="" disabled>
      -- Select Category --
    </MenuItem>

    {/* Actual category options */}
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
</Grid>




          <Grid item xs={6} sm={2}>
            <TextField
              label="Qty"
              name="quantity"
              type="number"
              value={item.quantity}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              required
              size="small"
            />
          </Grid>

          <Grid item xs={6} sm={2}>
            <TextField
              select
              label="Unit"
              name="unit"
              value={item.unit}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              size="small"
            >
              {unitOptions.map((unit, i) => (
                <MenuItem key={i} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} sm={1.5}>
            <TextField
              label="Price"
              name="pricePerUnit"
              type="number"
              value={item.pricePerUnit}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={6} sm={1.5}>
            <TextField
              label="Low Limit"
              name="lowStockLimit"
              type="number"
              value={item.lowStockLimit}
              onChange={(e) => handleChange(index, e)}
              fullWidth
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={0.5}>
            <IconButton
              color="error"
              onClick={() => handleRemoveRow(index)}
              disabled={items.length === 1}
            >
              <RemoveCircle />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Stack direction="row" spacing={2} mt={3}>
        <Button variant="outlined" onClick={handleAddRow} startIcon={<AddCircle />}>
          Add Row
        </Button>
        <Button type="submit" variant="contained">
          Submit
        </Button>
      </Stack>
    </Box>
  );
}
