import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Box, Typography, TextField,
  Button, Card, CardContent, InputAdornment, IconButton
} from '@mui/material';
import { toast } from 'react-toastify';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Login successful!");
      navigate('/dashboard');
    } catch (error) {
      toast.error("Login failed: " + error.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(to right, #1e3c72, #2a5298)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 3, boxShadow: 5 }}>
        <CardContent sx={{ px: 4, py: 5 }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 600 }}>
            Inventory Login
          </Typography>

          <Box component="form" onSubmit={handleLogin} noValidate>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              margin="normal"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mt: 2 }}
            />

            <TextField
              label="Password"
              type={showPassword ? 'text' : 'password'}
              fullWidth
              required
              margin="normal"
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                backgroundColor: '#1e88e5',
                '&:hover': {
                  backgroundColor: '#1565c0',
                },
                py: 1.3,
                fontWeight: 'bold',
              }}
            >
              Login
            </Button>

            <Typography align="center" sx={{ mt: 3, fontSize: 14 }}>
              Don’t have an account?{' '}
              <Link to="/register" style={{ color: '#1e88e5', fontWeight: 500 }}>
                Register
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
