import React, { useEffect, useState } from 'react';
import {
  Container, Typography, TextField, Button, Avatar, Box, CircularProgress
} from '@mui/material';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom'; // 👈 ADD THIS

const EditProfile = () => {
  const { user, userData, setUserData } = useAuth();
  const [name, setName] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 👈 INITIALIZE

  useEffect(() => {
    if (userData) {
      setName(userData.name || '');
      setLogoPreview(userData.logo || '');
    }
  }, [userData]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Store name is required!');
    if (!user) return;

    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      let logoURL = userData.logo || '';

      if (logoFile) {
        const storageRef = ref(storage, `logos/${user.uid}/${logoFile.name}`);
        await uploadBytes(storageRef, logoFile);
        logoURL = await getDownloadURL(storageRef);
      }

      await updateDoc(userRef, { name, logo: logoURL });
      setUserData((prev) => ({ ...prev, name, logo: logoURL }));
      toast.success('Profile updated!');

      navigate('/dashboard', { state: { message: 'Profile updated successfully!' } });
 // 👈 REDIRECT AFTER SAVE
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>Edit Profile</Typography>

      <TextField
        label="Store Name"
        variant="outlined"
        fullWidth
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button variant="outlined" component="label">
          Upload Logo
          <input hidden type="file" accept="image/*" onChange={handleLogoChange} />
        </Button>
        {logoPreview && <Avatar src={logoPreview} sx={{ width: 48, height: 48 }} />}
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
      </Button>
    </Container>
  );
};

export default EditProfile;
