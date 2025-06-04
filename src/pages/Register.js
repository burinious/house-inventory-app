import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  doc, setDoc
} from 'firebase/firestore';
import {
  ref, uploadBytes, getDownloadURL
} from 'firebase/storage';
import { auth, db, storage } from '../firebase';
import {
  Box, Button, Card, CardContent, Container, TextField,
  Typography, Avatar, IconButton, InputAdornment
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return toast.error('Please fill in all fields');
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      let logoURL = '';
      if (logo) {
        const logoRef = ref(storage, `logos/${user.uid}`);
        await uploadBytes(logoRef, logo);
        logoURL = await getDownloadURL(logoRef);
      }

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        logoURL
      });

      toast.success(`Welcome, ${fullName}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #2c3e50, #4ca1af)',
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', p: 3, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Register Your Store / Account
          </Typography>

          <Box component="form" onSubmit={handleRegister}>
            <TextField
              label="Full Name"
              fullWidth
              required
              margin="normal"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />

            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Box mt={2} mb={1}>
              <Typography variant="body2">Upload Brand Logo (Optional)</Typography>
              {logoPreview && (
                <Avatar
                  src={logoPreview}
                  alt="Logo Preview"
                  sx={{ width: 60, height: 60, my: 1 }}
                />
              )}
              <Button variant="outlined" component="label">
                Choose File
                <input hidden type="file" accept="image/*" onChange={handleLogoChange} />
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, py: 1.2, fontWeight: 'bold' }}
            >
              Register
            </Button>

            <Typography align="center" sx={{ mt: 2 }}>
              Already have an account?{' '}
              <Link to="/" style={{ color: '#1976d2' }}>Login</Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
