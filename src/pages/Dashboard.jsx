import React, { useEffect, useState, useRef } from "react";
import {
  Box, Grid, Paper, Typography, Avatar, TextField, MenuItem, Button,
  InputAdornment, Stack, Card, CardContent, CardActions, IconButton, Chip
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningIcon from "@mui/icons-material/Warning";
import { Chart } from "chart.js/auto";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { toast } from "react-toastify";

// === Low Stock logic helpers ===
const LOW_STOCK_THRESHOLD = 1;
const getLowStockLimit = (item) =>
  (item.lowStockLimit !== undefined && item.lowStockLimit !== null)
    ? Number(item.lowStockLimit)
    : LOW_STOCK_THRESHOLD;

const shouldShowLowStock = (item) => {
  const qty = Number(item.quantity);
  const limit = getLowStockLimit(item);
  if (limit === 0) {
    return qty === 0; // Only warn if truly out of stock
  }
  return qty <= limit;
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

  const fetchItems = async () => {
    try {
      const snapshot = await getDocs(collection(db, `users/${user.uid}/items`));
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(data);
      setFilteredItems(data);
    } catch (error) {
      toast.error("Failed to load items.");
    }
  };

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line
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

  useEffect(() => {
    const categoryTotals = items.reduce((acc, item) => {
      const total = item.price || item.pricePerUnit * item.quantity;
      acc[item.category] = (acc[item.category] || 0) + total;
      return acc;
    }, {});
    const data = {
      labels: Object.keys(categoryTotals),
      datasets: [{
        data: Object.values(categoryTotals),
        backgroundColor: [
          "#42a5f5", "#66bb6a", "#ffa726", "#ef5350", "#ab47bc"
        ]
      }]
    };
    if (chartInstance.current) chartInstance.current.destroy();
    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: "pie",
        data,
        options: {
          plugins: {
            legend: {
              labels: {
                font: { family: "Poppins, Inter, sans-serif" }
              }
            }
          }
        }
      });
    }
  }, [items]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", user.uid, "items", id));
      toast.success("Item deleted");
      fetchItems();
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const uniqueCategories = ["All", ...new Set(items.map((i) => i.category))];
  const netWorth = items.reduce((acc, item) => acc + (item.price || item.pricePerUnit * item.quantity), 0);

  // For a summary alert
  const lowStockItems = items.filter(shouldShowLowStock);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif"
      }}
    >
      {/* Sticky Welcome Section */}
      <Paper
        elevation={4}
        sx={{
          p: { xs: 1, md: 2 },
          position: "sticky",
          top: 0,
          zIndex: 1000,
          bgcolor: "#fff",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1.5px solid #e3e9f7",
          boxShadow: "0 4px 18px 0 #e3e9f7"
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            src={userData?.logo || ""}
            sx={{
              bgcolor: "#1976d2",
              color: "#fff",
              fontWeight: "bold",
              width: 56,
              height: 56,
              fontSize: 30,
              mr: 1
            }}
          >
            {userData?.name?.[0]?.toUpperCase() || "U"}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Welcome, {userData?.name || "User"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your inventory and finances overview.
            </Typography>
          </Box>
        </Box>
        {lowStockItems.length > 0 && (
          <Chip
            color="error"
            icon={<WarningIcon />}
            label={
              <span>
                <b>{lowStockItems.length}</b> low stock item{lowStockItems.length > 1 ? "s" : ""}
              </span>
            }
            sx={{
              fontWeight: "bold",
              fontSize: 16,
              px: 1.5,
              background: "linear-gradient(90deg,#ff7979,#f44336)",
              color: "#fff",
              boxShadow: 2,
              animation: "pulse 1.1s infinite alternate",
              "@keyframes pulse": {
                from: { boxShadow: "0 0 0 0 #f4433644" },
                to: { boxShadow: "0 0 12px 2px #f4433666" }
              }
            }}
          />
        )}
      </Paper>

      {/* Main Content Area */}
      <Box sx={{ display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Left - Chart */}
        <Box
          sx={{
            width: { xs: "100%", md: "30%" },
            p: 2,
            borderRight: { md: "1.5px solid #e3e9f7" },
            bgcolor: "#f5faff",
            minWidth: { md: 260 },
            position: { md: "sticky" },
            top: { md: 74 },
            height: { md: "calc(100vh - 74px)" }
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              boxShadow: 4,
              background: "linear-gradient(120deg,#e3f0fc,#fafdff 85%)"
            }}
          >
            <canvas ref={chartRef} />
            <Typography
              align="center"
              mt={2}
              fontWeight="bold"
              sx={{
                fontSize: 22,
                color: "#1565c0",
                letterSpacing: 1.2
              }}
            >
              Net Worth
            </Typography>
            <Typography
              align="center"
              variant="h5"
              fontWeight="bold"
              sx={{
                mt: 0.5,
                color: "#10a36e",
                letterSpacing: 2
              }}
            >
              ₦{netWorth.toLocaleString()}
            </Typography>
          </Paper>
        </Box>

        {/* Right - Filters and Inventory */}
        <Box
          sx={{
            width: { xs: "100%", md: "70%" },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            background: "linear-gradient(110deg,#fff 60%,#e3f2fd 100%)"
          }}
        >
          {/* Filters */}
          <Box sx={{ p: { xs: 1.5, md: 3 }, flexShrink: 0 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ md: "center" }}
              justifyContent="space-between"
            >
              <TextField
                label="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: "#fff", borderRadius: 2, minWidth: 180 }}
              />
              <TextField
                select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{ bgcolor: "#fff", borderRadius: 2, minWidth: 180 }}
              >
                {uniqueCategories.map((cat, i) => (
                  <MenuItem key={i} value={cat}>
                    {cat}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="contained"
                onClick={() => navigate("/add")}
                size="large"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  boxShadow: 2,
                  borderRadius: 2,
                  bgcolor: "#1565c0",
                  "&:hover": {
                    bgcolor: "#1976d2"
                  }
                }}
              >
                Add Item
              </Button>
            </Stack>
          </Box>

          {/* Inventory Cards (Scrollable) */}
          <Box
            sx={{
              overflowY: "auto",
              p: { xs: 1.5, md: 3 },
              flexGrow: 1,
              "&::-webkit-scrollbar": {
                width: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "#1976d2",
                borderRadius: 8,
              }
            }}
          >
            <Grid container spacing={3}>
              {filteredItems.map(item => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: 3,
                      bgcolor: "#fafdff",
                      transition: "transform 0.18s",
                      "&:hover": {
                        transform: "translateY(-5px) scale(1.025)",
                        boxShadow: 7,
                        borderColor: "#42a5f5"
                      },
                      border: "1px solid #e3e9f7"
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          bgcolor: "#e3f2fd",
                          color: "#1976d2",
                          mb: 1,
                          width: 46,
                          height: 46
                        }}
                      >
                        <Inventory2Icon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {item.name}
                      </Typography>
                      <Stack direction="row" spacing={1} mb={1} alignItems="center">
                        <CategoryIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight="500" color="#666">{item.category}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} mb={1} alignItems="center">
                        <Inventory2Icon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight="500" color="#333">
                          Qty: {item.quantity}
                        </Typography>
                        {/* Low Stock logic */}
                        {shouldShowLowStock(item) && (
                          <Chip
                            label={getLowStockLimit(item) === 0 ? "Out of Stock!" : "Low Stock!"}
                            color="error"
                            size="small"
                            sx={{
                              ml: 1,
                              fontWeight: "bold",
                              animation: "pulse 1.1s infinite alternate",
                              "@keyframes pulse": {
                                from: { boxShadow: "0 0 0 0 #f4433644" },
                                to: { boxShadow: "0 0 9px 2px #f4433666" }
                              }
                            }}
                          />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={1} mb={1} alignItems="center">
                        <MonetizationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="#333">
                          Price per unit: ₦{item.pricePerUnit}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <MonetizationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" fontWeight="bold" color="#1565c0">
                          Total: ₦{item.price || item.pricePerUnit * item.quantity}
                        </Typography>
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <IconButton color="primary" onClick={() => navigate(`/edit/${item.id}`)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(item.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
              {filteredItems.length === 0 && (
                <Grid item xs={12}>
                  <Typography align="center" color="text.secondary" sx={{ py: 6 }}>
                    No items found.
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
