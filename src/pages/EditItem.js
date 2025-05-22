import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box
} from '@mui/material';
import { toast } from 'react-toastify';

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState({
    name: '',
    category: '',
    pricePerUnit: '',
    quantity: ''
  });

  const fetchItem = async () => {
    const docRef = doc(db, 'items', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      setItem(docSnap.data());
    } else {
      toast.error("Item not found");
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    setItem({ ...item, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = doc(db, 'items', id);

    try {
      await updateDoc(docRef, {
        name: item.name,
        category: item.category,
        pricePerUnit: parseFloat(item.pricePerUnit),
        quantity: parseInt(item.quantity, 10),
      });
      toast.success('Item updated successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error updating item');
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h5" mt={4}>Edit Item</Typography>
      <Box component="form" mt={3} onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Name"
          name="name"
          value={item.name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Category"
          name="category"
          value={item.category}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Price per Unit"
          name="pricePerUnit"
          value={item.pricePerUnit}
          onChange={handleChange}
          margin="normal"
          required
          type="number"
          inputProps={{ step: "0.01", min: "0" }}
        />
        <TextField
          fullWidth
          label="Quantity"
          name="quantity"
          value={item.quantity}
          onChange={handleChange}
          margin="normal"
          required
          type="number"
          inputProps={{ min: "0" }}
        />
        <Box mt={2}>
          <Button variant="contained" color="primary" type="submit">
            Update Item
          </Button>
          <Button variant="outlined" onClick={() => navigate('/dashboard')} sx={{ ml: 2 }}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
