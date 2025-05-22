import { useEffect, useState } from 'react';
import { Container, Box, Typography, Button } from '@mui/material';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(currentUser => {
      if (currentUser) setUser(currentUser);
      else navigate('/');
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <Container maxWidth="sm">
      <Box mt={10} p={4} boxShadow={3} borderRadius={2}>
        <Typography variant="h4" mb={3}>User Profile</Typography>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>User ID:</strong> {user.uid}</Typography>
        <Button variant="contained" sx={{ mt: 4 }} onClick={handleLogout}>Logout</Button>
      </Box>
    </Container>
  );
}
