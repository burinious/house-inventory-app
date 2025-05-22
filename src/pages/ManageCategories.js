import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Grid, Card,
  CardContent, CardActions, IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-toastify';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingId, setEditingId] = useState(null);

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, 'categories'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddOrUpdate = async () => {
    if (!categoryName.trim()) {
      toast.error('Category name cannot be empty');
      return;
    }

    try {
      if (editingId) {
        const docRef = doc(db, 'categories', editingId);
        await updateDoc(docRef, { name: categoryName });
        toast.success('Category updated!');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'categories'), { name: categoryName });
        toast.success('Category added!');
      }
      setCategoryName('');
      fetchCategories();
    } catch (error) {
      console.error(error);
      toast.error('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setCategoryName(category.name);
    setEditingId(category.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', id));
        toast.success('Category deleted');
        fetchCategories();
      } catch (error) {
        console.error(error);
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <Container>
      <Typography variant="h4" mt={4} mb={2}>Manage Categories</Typography>
      <Grid container spacing={2} alignItems="center" mb={3}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Category Name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleAddOrUpdate}
          >
            {editingId ? 'Update Category' : 'Add Category'}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {categories.map(category => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{category.name}</Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEdit(category)}>
                  <EditIcon color="primary" />
                </IconButton>
                <IconButton onClick={() => handleDelete(category.id)}>
                  <DeleteIcon color="error" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ManageCategories;
