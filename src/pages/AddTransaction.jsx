import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, MenuItem,
  Paper, Box, Stack
} from '@mui/material';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function AddTransaction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 10);

  const [type, setType] = useState('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(today);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !category) {
      toast.error("Please fill in all required fields.");
      return;
    }
    if (!user) {
      toast.error("User not found.");
      return;
    }

    try {
      await addDoc(collection(db, `users/${user.uid}/transactions`), {
        type,
        amount: parseFloat(amount),
        category,
        description,
        date: Timestamp.fromDate(new Date(date)),
        createdAt: Timestamp.now(),
      });

      toast.success("Transaction added successfully!");
      setAmount('');
      setCategory('');
      setDescription('');
      setDate(today);

      navigate("/transactions");
    } catch (error) {
      toast.error("Failed to add transaction.");
    }
  };

  // Optionally, fetch categories from DB. Static for now:
  const categories = [
    "Salary", "Business", "Food", "Transport", "Shopping", "Bills", "Other"
  ];

  return (
    <Box sx={{
      bgcolor: "#f4f8fb",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      py: { xs: 2, md: 6 }
    }}>
      <Container maxWidth="sm">
        <Paper
          elevation={4}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 4,
            maxWidth: 500,
            mx: "auto",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <MonetizationOnIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Add New Transaction
            </Typography>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                select
                label="Transaction Type *"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                fullWidth
              >
                <MenuItem value="income">Income</MenuItem>
                <MenuItem value="expense">Expense</MenuItem>
              </TextField>

              <TextField
                label="Amount (₦) *"
                type="number"
                value={amount}
                inputProps={{ min: 0 }}
                onChange={(e) => setAmount(e.target.value)}
                required
                fullWidth
              />

              <TextField
                select
                label="Category *"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                fullWidth
              >
                {categories.map((cat, idx) => (
                  <MenuItem key={idx} value={cat}>{cat}</MenuItem>
                ))}
              </TextField>

              <TextField
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                sx={{
                  fontWeight: "bold",
                  borderRadius: 2,
                  boxShadow: "none"
                }}
                fullWidth
              >
                Add Transaction
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
