import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Typography, Paper, Grid } from '@mui/material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ResetPassword = () => {
  const { category, token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/reset-password/${category}/${token}`, {
        newPassword
      });
      setMessage({ text: res.data.message, type: 'success' });
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Something went wrong',
        type: 'error',
      });
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={8} md={5}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" mb={2} color="#648E87">
            Reset Your Password
          </Typography>
          {message.text && <Alert severity={message.type}>{message.text}</Alert>}
          <form onSubmit={handleSubmit}>
            <TextField
              type="password"
              label="New Password"
              fullWidth
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#648E87' }}>
              Reset Password
            </Button>
          </form>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default ResetPassword;
