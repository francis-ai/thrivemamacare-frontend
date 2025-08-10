import React, { useState, useContext } from 'react';
import {
  Box,
  TextField,
  Button,
  Snackbar,
  Alert,
  Typography,
  Paper
} from '@mui/material';
import { AuthContext } from '../context/AuthContext';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Payment = () => {
  const { user, caregiver } = useContext(AuthContext);
  const loggedInEmail = user?.email || caregiver?.email;
  const userId = user?.id || caregiver?.id;
  const userType = user ? 'user' : 'caregiver';

  const [amount, setAmount] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const payWithPaystack = (e) => {
    e.preventDefault();

    const handler = window.PaystackPop.setup({
      key: 'pk_test_5624a1b37a80ce2f38d7d2da8e5d02a2a405d8de',
      email: loggedInEmail,
      amount: Number(amount) * 100,
      currency: 'NGN',
      ref: '' + Math.floor(Math.random() * 1000000000 + 1),
      callback: function (response) {
        fetch(`${BASE_URL}/api/auth/verify-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reference: response.reference,
            email: loggedInEmail,
            user_id: userId,
            user_type: userType,
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            setSnackbar({
              open: true,
              message: data.message || 'Payment verified successfully.',
              severity: 'success',
            });
          })
          .catch((err) => {
            console.error('Verification failed:', err);
            setSnackbar({
              open: true,
              message: 'Payment verified but backend failed to save.',
              severity: 'error',
            });
          });
      },
      onClose: function () {
        setSnackbar({
          open: true,
          message: 'Transaction was not completed.',
          severity: 'warning',
        });
      },
    });

    handler.openIframe();
  };

  return (
    <Box sx={{ mt: '100px', mb: '50px', display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ p: 4, width: '100%', maxWidth: 500 }}>
        <Typography variant="h5" gutterBottom>
          Pay with Paystack
        </Typography>
        <form onSubmit={payWithPaystack}>
          <TextField
            label="Email"
            type="email"
            required
            fullWidth
            margin="normal"
            value={loggedInEmail}
            placeholder="User Email"
            InputProps={{ readOnly: true }}
          />
          <TextField
            label="Amount (₦)"
            type="number"
            required
            fullWidth
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            type="submit"
            fullWidth
            sx={{ mt: 2 }}
          >
            Pay Now
          </Button>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%' }}
          onClose={handleSnackbarClose}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Payment;
