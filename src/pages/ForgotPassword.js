import React, { useState } from 'react';
import { TextField, Button, Alert, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("👉 BASE_URL:", BASE_URL);
    console.log("👉 Email entered:", email);

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/forgot-password`, { email });
      console.log("✅ Backend response:", res.data);

      setMessage({ type: 'success', text: res.data.message });
    } catch (err) {
      console.error("❌ Request failed:", err.response?.data || err.message);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Request failed.' });
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={8} md={5}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2} color="#648E87">
            Forgot Password
          </Typography>
          {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              label="Email Address"
              type="email"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ my: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#648E87' }}>
              Send Reset Link
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ForgotPassword;
