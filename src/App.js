import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddItem from './pages/AddItemTabs.jsx';
import EditItem from './pages/EditItem';
import EditProfile from './pages/EditProfile';
import ManageCategories from './pages/ManageCategories';
import Layout from './components/Layout';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Layout Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/edit/:id" element={<EditItem />} />
            <Route path="/categories" element={<ManageCategories />} />
            <Route path="/edit-profile" element={<EditProfile />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/transactions" element={<Transactions />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
