import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Card,
  CardContent, CardActions, IconButton, Box, Paper, Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import {
  collection, addDoc, getDocs, deleteDoc, doc, updateDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user) return;
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      const snapshot = await getDocs(categoriesRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line
  }, [user]);

  const handleAddOrUpdate = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }
    setLoading(true);
    try {
      const categoriesRef = collection(db, 'users', user.uid, 'categories');
      if (editingId) {
        const docRef = doc(db, 'users', user.uid, 'categories', editingId);
        await updateDoc(docRef, { name: categoryName });
        toast.success('Category updated!');
        setEditingId(null);
      } else {
        await addDoc(categoriesRef, { name: categoryName });
        toast.success('Category added!');
      }
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      toast.error('Error saving category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'categories', id));
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <Box sx={{
      bgcolor: "#f4f8fb",
      minHeight: "100vh",
      py: { xs: 2, md: 5 }
    }}>
      <Container maxWidth="sm">
        <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <CategoryIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="bold">
              Manage Categories
            </Typography>
          </Stack>

          <form onSubmit={e => { e.preventDefault(); handleAddOrUpdate(); }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                autoFocus
                disabled={loading}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ minWidth: 150, fontWeight: "bold" }}
                disabled={!categoryName.trim() || loading}
              >
                {editingId ? 'Update' : 'Add'}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>

      <Container maxWidth="md">
        <Grid container spacing={3}>
          {categories.length === 0 && (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary">
                No categories found.
              </Typography>
            </Grid>
          )}
          {categories.map(category => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <Card
                elevation={2}
                sx={{
                  borderRadius: 3,
                  bgcolor: "#fff",
                  border: "1px solid #e3e8ee"
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CategoryIcon sx={{ color: "primary.main", fontSize: 30 }} />
                    <Typography variant="h6" fontWeight="bold">
                      {category.name}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <IconButton onClick={() => handleEdit(category)} title="Edit">
                    <EditIcon color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(category.id)} title="Delete">
                    <DeleteIcon color="error" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default ManageCategories;
