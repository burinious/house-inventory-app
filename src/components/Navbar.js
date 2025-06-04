import React from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { toast } from 'react-toastify';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Successfully logged out!");
      navigate('/');
    } catch (error) {
      toast.error("Logout failed!");
    }
  };

  return (
    <div style={styles.navbar}>
      <h2>🏠 House Inventory</h2>
      <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
    </div>
  );
}

const styles = {
  navbar: {
    height: '60px',
    background: '#1976d2',
    color: 'white',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
  },
  logoutBtn: {
    background: 'white',
    color: '#1976d2',
    border: 'none',
    padding: '8px 12px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
