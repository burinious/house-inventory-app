import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  MenuItem,
  Stack,
  Paper,
  Avatar,
  Box,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { IconButton } from "@mui/material";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import CategoryIcon from "@mui/icons-material/Category";
import Inventory2Icon from "@mui/icons-material/Inventory2";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [userName, setUserName] = useState("");
  const [userLogo, setUserLogo] = useState("");
  const navigate = useNavigate();

  // Fetch inventory items
  const fetchItems = async () => {
    const snapshot = await getDocs(collection(db, "items"));
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setItems(data);
    setFilteredItems(data);
  };

  // Fetch user data from Firestore (assuming user data stored in 'users' collection)
  const fetchUserData = async (uid) => {
    try {
      const userDoc = await doc(db, "users", uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        setUserName(data.name || "");
        setUserLogo(data.avatarUrl || "");
      } else {
        // fallback to auth displayName
        setUserName(auth.currentUser?.displayName || "");
        setUserLogo("");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserName(auth.currentUser?.displayName || "");
      setUserLogo("");
    }
  };

  useEffect(() => {
    fetchItems();

    // Subscribe to auth state for user info
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

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

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "items", id));
    fetchItems();
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  const uniqueCategories = [
    "All",
    ...new Set(items.map((item) => item.category)),
  ];

  return (
    <Container>
      {/* Beautiful Header */}
      <Paper
        elevation={3}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: 2,
          mt: 4,
          mb: 3,
          borderRadius: 3,
          bgcolor: "background.paper",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        {userLogo ? (
          <Avatar
            alt={userName}
            src={userLogo}
            sx={{ width: 64, height: 64, border: "2px solid #1976d2" }}
          />
        ) : (
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: "#1976d2",
              fontSize: 28,
              fontWeight: "bold",
              color: "white",
              border: "2px solid #1565c0",
            }}
          >
            {userName ? userName.charAt(0).toUpperCase() : "U"}
          </Avatar>
        )}

        <Box>
          <Typography
            variant="h5"
            fontWeight="700"
            color="primary.main"
            gutterBottom
          >
            Welcome, {userName || "User"}!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Here’s your inventory at a glance.
          </Typography>
        </Box>
      </Paper>

      {/* Filters and buttons */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        mb={3}
      >
        <TextField
          label="Search"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          select
          label="Filter by Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          {uniqueCategories.map((cat, idx) => (
            <MenuItem key={idx} value={cat}>
              {cat}
            </MenuItem>
          ))}
        </TextField>

        <Button variant="contained" onClick={() => navigate("/add")}>
          Add Item
        </Button>
        {/* Removed Logout button here */}
      </Stack>

      {/* Inventory items grid */}
      <Grid container spacing={2}>
        {filteredItems.length ? (
          filteredItems.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight="700" gutterBottom>
                    {item.name}
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <CategoryIcon color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {item.category}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Inventory2Icon color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <MonetizationOnIcon color="action" />
                    <Typography variant="body2" color="textSecondary">
                      Price per unit: ₦
                      {item.pricePerUnit ?? item.unitPrice ?? "N/A"}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <MonetizationOnIcon color="action" />
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      fontWeight="700"
                    >
                      Total Price: ₦
                      {item.price ?? item.pricePerUnit * item.quantity ?? "N/A"}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <IconButton
                    color="primary"
                    aria-label="edit item"
                    onClick={() => navigate(`/edit/${item.id}`)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    aria-label="delete item"
                    onClick={() => handleDelete(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography variant="body1">No items found.</Typography>
        )}
      </Grid>
    </Container>
  );
}
