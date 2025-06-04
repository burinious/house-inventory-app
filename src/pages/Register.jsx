import React, { useState } from 'react';
import {
  createUserWithEmailAndPassword
} from 'firebase/auth';
import {
  doc, setDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import {
  Box, Button, Card, CardContent, Typography, TextField,
  Avatar, IconButton, InputAdornment
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Function to get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0]?.toUpperCase())
      .slice(0, 2)
      .join('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      return toast.error('Please fill in all fields');
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        logoURL: '', // No actual logo
        initials: getInitials(fullName)
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
        padding: 2
      }}
    >
      <Card sx={{ maxWidth: 450, width: '100%', p: 3, borderRadius: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Register Your Store / Account
          </Typography>

          <Box display="flex" justifyContent="center" mb={2}>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2', fontSize: 24 }}>
              {getInitials(fullName)}
            </Avatar>
          </Box>

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
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

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
