import React, { useEffect, useState } from 'react';
import {
  Box, Container, Typography, Paper, Chip,
  Divider, List, ListItem, ListItemText, ListItemSecondaryAction
} from '@mui/material';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { MonetizationOn } from '@mui/icons-material';
import Sidebar from '../components/Sidebar';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!user) return;

      try {
        const snapshot = await getDocs(collection(db, `users/${user.uid}/transactions`));
        const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => {
          const aDate = a.date?.toDate?.() || new Date(0);
          const bDate = b.date?.toDate?.() || new Date(0);
          return bDate - aDate;
        });
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    fetchTransactions();
  }, [user]);

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth="md" sx={{ mt: 4, ml: { md: '260px' }, px: 2 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Transaction History
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Chip label={`Total Income: ₦${totalIncome}`} color="success" />
            <Chip label={`Total Expenses: ₦${totalExpense}`} color="error" />
            <Chip label={`Net Balance: ₦${totalIncome - totalExpense}`} color="primary" />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {transactions.length === 0 ? (
            <Typography variant="body2" align="center" sx={{ mt: 4 }}>
              No transactions yet.
            </Typography>
          ) : (
            <List>
              {transactions.map((tx) => {
                const txDate = tx.date?.toDate?.();
                const formattedDate = txDate ? format(txDate, 'dd MMM yyyy') : 'No Date';

                return (
                  <ListItem
                    key={tx.id}
                    sx={{
                      bgcolor: tx.type === 'income' ? '#e8f5e9' : '#ffebee',
                      mb: 1,
                      borderRadius: 2
                    }}
                  >
                    <ListItemText
                      primary={`${tx.category || 'Uncategorized'} - ₦${tx.amount}`}
                      secondary={`${tx.description || 'No description'} (${formattedDate})`}
                    />
                    <ListItemSecondaryAction>
                      <Chip
                        label={tx.type?.toUpperCase() || 'N/A'}
                        color={tx.type === 'income' ? 'success' : 'error'}
                        icon={<MonetizationOn />}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
