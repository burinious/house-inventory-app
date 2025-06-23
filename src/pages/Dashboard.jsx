import React, { useEffect, useState, useRef, useMemo } from "react";
import {
  Box, Grid, Paper, Typography, Avatar, TextField, MenuItem, Button,
  InputAdornment, Stack, Card, CardContent, CardActions, IconButton, Chip,
  Container, LinearProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import {
  collection, onSnapshot, deleteDoc, doc,
  updateDoc, addDoc, serverTimestamp, runTransaction
} from "firebase/firestore";
import { toast } from "react-toastify";

// NOTE: Ideally, define this in a separate theme.js and use <ThemeProvider>
const theme = {
  palette: {
    primary: { main: '#6366F1' },
    secondary: { main: '#10B981' },
    background: { default: '#F8F9FA', paper: '#FFFFFF' },
    text: { primary: '#1F2937', secondary: '#6B7280' },
    error: { main: '#EF4444' }, // A clearer red
    warning: { main: '#F59E0B' },
  },
  typography: { fontFamily: '"Inter", sans-serif' },
  shape: { borderRadius: 16 }, // Slightly more rounded
};

const LOW_STOCK_THRESHOLD = 1;
const getLowStockLimit = (item) =>
  item.lowStockLimit !== undefined && item.lowStockLimit !== null
    ? Number(item.lowStockLimit)
    : LOW_STOCK_THRESHOLD;

// --- Card Helper Functions ---
const calculateStockPercentage = (item) => {
  // Assume a "healthy" stock level is 5x the low stock limit, or 20 if limit is low.
  const lowStockLimit = getLowStockLimit(item);
  const maxStock = Math.max(20, lowStockLimit * 5);
  const percentage = (item.quantity / maxStock) * 100;
  return Math.min(percentage, 100); // Cap at 100%
};

const getStockColor = (item) => {
  const qty = Number(item.quantity);
  const limit = getLowStockLimit(item);
  if (qty === 0) return 'error';
  if (qty <= limit) return 'error';
  if (qty <= limit * 2) return 'warning'; // Warning when it's getting close
  return 'primary';
};


export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const navigate = useNavigate();
  const { user, userData } = useAuth();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!user) return navigate("/login");
    const unsub = onSnapshot(collection(db, `users/${user.uid}/items`), (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user, navigate]);

  useEffect(() => {
    let filtered = items;
    if (category !== "All") {
      filtered = filtered.filter((item) => item.category === category);
    }
    if (search) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [search, category, items]);

  const categoryTotals = useMemo(() => items.reduce((acc, item) => {
    const total = item.price || item.pricePerUnit * item.quantity;
    acc[item.category] = (acc[item.category] || 0) + total;
    return acc;
  }, {}), [items]);

  useEffect(() => {
    const data = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: ["#6366F1", "#10B981", "#F59E0B", "#EF4444", "#3B82F6", "#8B5CF6"],
        borderColor: theme.palette.background.paper,
        borderWidth: 4,
      }]
    };
    if (chartInstance.current) chartInstance.current.destroy();
    if (chartRef.current && Object.keys(categoryTotals).length > 0) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "doughnut",
        data,
        options: {
          responsive: true,
          cutout: '75%',
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Value by Category',
              font: { size: 18, family: theme.typography.fontFamily },
              padding: { bottom: 20 },
              color: theme.palette.text.primary,
            }
          }
        }
      });
    }
  }, [categoryTotals]);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
        try {
            await deleteDoc(doc(db, "users", user.uid, "items", id));
            toast.success("Item deleted successfully");
        } catch {
            toast.error("Failed to delete item");
        }
    }
  };

  const handleUseItem = async (id, currentQty, itemName) => {
    if (currentQty <= 0) {
      toast.warning("This item is already out of stock.");
      return;
    }
    try {
        await runTransaction(db, async (transaction) => {
            const itemRef = doc(db, "users", user.uid, "items", id);
            const itemDoc = await transaction.get(itemRef);
            if (!itemDoc.exists()) throw new Error("Item document does not exist!");
            const newQty = itemDoc.data().quantity - 1;
            transaction.update(itemRef, { quantity: newQty });
            const transactionColRef = collection(db, `users/${user.uid}/transactions`);
            transaction.set(doc(transactionColRef), {
                type: "usage", itemId: id, itemName: itemName, quantity: 1, timestamp: serverTimestamp(),
            });
        });
        toast.success(`Used one ${itemName}.`);
    } catch (error) {
      console.error("Transaction failed: ", error);
      toast.error("Failed to update item quantity.");
    }
  };

  const uniqueCategories = ["All", ...new Set(items.map((i) => i.category))];
  const netWorth = items.reduce((acc, item) => acc + (item.price || item.pricePerUnit * item.quantity), 0);
  const lowStockItems = items.filter(item => getStockColor(item) === 'error' || getStockColor(item) === 'warning');

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: { xs: 0, sm: 2 } }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: theme.palette.background.default, borderRadius: { xs: 0, sm: theme.shape.borderRadius / 2 }, overflow: 'hidden' }}>
            {/* Top bar */}
            <Box sx={{ p: 2, bgcolor: theme.palette.background.paper, borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar src={userData?.logo || ""} sx={{ bgcolor: theme.palette.primary.main, width: 48, height: 48, color: '#FFFFFF', fontWeight: 'bold' }}>{userData?.name?.[0]?.toUpperCase() || "U"}</Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: '600', color: theme.palette.text.primary }}>Welcome, {userData?.name || "User"}</Typography>
                        <Typography variant="body2" color={theme.palette.text.secondary}>Here is your inventory at a glance.</Typography>
                    </Box>
                </Box>
            </Box>

            {/* Summary Stat Cards */}
            <Box sx={{ p: { xs: 2, md: 3 } }}>
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} sm={6} lg={3}>
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius }}>
                            <Typography variant="body2" color={theme.palette.text.secondary}>Total Value</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}>₦{netWorth.toLocaleString()}</Typography>
                        </Paper>
                    </Grid>
                    {/* Other stat cards */}
                    <Grid item xs={12} sm={6} lg={3}>
                         <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius }}>
                            <Typography variant="body2" color={theme.palette.text.secondary}>Total Items</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{items.length}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                         <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius }}>
                            <Typography variant="body2" color={theme.palette.text.secondary}>Categories</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{uniqueCategories.length - 1}</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} lg={3}>
                         <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius, bgcolor: lowStockItems.length > 0 ? '#FFFBEB' : 'inherit' }}>
                            <Typography variant="body2" color={theme.palette.text.secondary}>Low Stock</Typography>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', color: lowStockItems.length > 0 ? theme.palette.warning.main : theme.palette.text.primary }}>{lowStockItems.length}</Typography>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* Main layout */}
            <Box sx={{ display: "flex", flexGrow: 1, overflow: 'hidden' }}>
                {/* Chart area */}
                <Box sx={{ width: "30%", p: 3, pt: 1, borderRight: { md: '1px solid #E5E7EB' }, display: { xs: 'none', lg: 'block' } }}>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: theme.shape.borderRadius, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <canvas ref={chartRef} />
                    </Paper>
                </Box>

                {/* Inventory + Filters */}
                <Box sx={{ width: { xs: '100%', lg: '70%' }, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <Box sx={{ p: 2, px: 3, borderBottom: '1px solid #E5E7EB' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                            <TextField fullWidth label="Search Items" value={search} onChange={(e) => setSearch(e.target.value)} size="small" InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>) }} />
                            <TextField select label="Category" value={category} onChange={(e) => setCategory(e.target.value)} size="small" sx={{minWidth: 150}}>
                                {uniqueCategories.map((cat, i) => (<MenuItem key={i} value={cat}>{cat}</MenuItem>))}
                            </TextField>
                            <Button variant="contained" onClick={() => navigate("/add")} size="medium" disableElevation sx={{ bgcolor: theme.palette.primary.main, '&:hover': { bgcolor: '#4F46E5' } }}>Add Item</Button>
                        </Stack>
                    </Box>

                    {/* Inventory Grid */}
                    <Box sx={{ p: 3, overflowY: "auto", flexGrow: 1 }}>
  <Grid container spacing={3}>
    {filteredItems.map((item) => (
      <Grid item xs={6} sm={4} md={2.4} key={item.id}>
        <Card
          variant="outlined"
          sx={{
            height: "100%",
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: 4,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'scale(1.02)',
              boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            },
          }}
        >
          <CardContent sx={{ flexGrow: 1, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Avatar sx={{ bgcolor: 'rgba(99, 102, 241, 0.1)', color: '#2563eb' }}>
                <Inventory2Icon />
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {item.category}
              </Typography>
            </Box>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {item.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Unit Price: ₦{item.pricePerUnit.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="primary" fontWeight="bold">
              Total: ₦{(item.pricePerUnit * item.quantity).toLocaleString()}
            </Typography>

            <Box sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" mb={0.5}>
                <Typography variant="caption" color="text.secondary">Stock Level</Typography>
                <Typography variant="caption" fontWeight="bold" color={`${getStockColor(item)}.main`}>
                  {item.quantity} Units
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={calculateStockPercentage(item)}
                color={getStockColor(item)}
                sx={{ height: 6, borderRadius: 4 }}
              />
            </Box>
          </CardContent>

          <CardActions sx={{ p: 1, borderTop: '1px solid #e5e7eb' }}>
            <Button
              size="small"
              onClick={() => handleUseItem(item.id, item.quantity, item.name)}
              sx={{ color: '#2563eb', fontWeight: 600 }}
            >
              Use 1
            </Button>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton size="small" onClick={() => navigate(`/edit/${item.id}`)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              sx={{ color: 'error.main' }}
              onClick={() => handleDelete(item.id)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      </Grid>
    ))}

    {filteredItems.length === 0 && (
      <Grid item xs={12}>
        <Typography align="center" color="text.secondary" sx={{ py: 8 }}>
          No items found. Add one to get started!
        </Typography>
      </Grid>
    )}
  </Grid>
</Box>

                </Box>
            </Box>
        </Box>
    </Container>
  );
}