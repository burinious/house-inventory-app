import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Box
} from '@mui/material';
import { toast } from 'react-toastify';

export default function AddItem() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    pricePerUnit: '',
  });

  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const categoryList = snapshot.docs.map(doc => doc.data().name);
        setCategories(categoryList);
      } catch (error) {
        console.error('Error fetching categories:', error);
        toast.error('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { name, category, quantity, pricePerUnit } = formData;

    if (!name || !category || !quantity || !pricePerUnit) {
      toast.error('All fields are required!');
      return;
    }

    try {
      await addDoc(collection(db, 'items'), {
        name,
        category,
        quantity: Number(quantity),
        pricePerUnit: Number(pricePerUnit),
        createdAt: serverTimestamp()
      });

      toast.success('Item added successfully!');
      setFormData({
        name: '',
        category: '',
        quantity: '',
        pricePerUnit: ''
      });
    } catch (error) {
      console.error(error);
      toast.error('Failed to add item');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4} mb={2}>Add New Item</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Item Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          select
          fullWidth
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          margin="normal"
        >
          {categories.length ? (
            categories.map((cat, index) => (
              <MenuItem key={index} value={cat}>
                {cat}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No categories available</MenuItem>
          )}
        </TextField>
        <TextField
          fullWidth
          label="Quantity"
          name="quantity"
          type="number"
          value={formData.quantity}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Price Per Unit (₦)"
          name="pricePerUnit"
          type="number"
          value={formData.pricePerUnit}
          onChange={handleChange}
          margin="normal"
        />
        <Box mt={2}>
          <Button type="submit" variant="contained" color="primary">
            Add Item
          </Button>
        </Box>
      </form>
    </Container>
  );
}
