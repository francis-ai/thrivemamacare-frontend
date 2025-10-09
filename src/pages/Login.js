import React, { useState } from 'react';
import {
  Grid, Box, Typography, TextField, Button, Alert, Paper,
  IconButton, InputAdornment
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path as needed

const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [showPassword, setShowPassword] = useState(false); // 👈 toggle state
  const { login } = useAuth(); // get login from context

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      const res = await axios.post(`${BASE_URL}/api/auth/login`, form);
      const user = res.data.user;

      if (!user || !user.type) {
        return setMessage({ text: 'Invalid login response.', type: 'error' });
      }

      login(user, user.type); // ✅ update AuthContext state

      if (user.type === 'caregiver') {
        navigate('/caregiver/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Login failed.',
        type: 'error',
      });
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" sx={{ minHeight: '100vh', backgroundColor: '#f4f6f8' }}>
      <Grid item xs={12} md={6} lg={5}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" mb={3} color="#648E87">
              Welcome Back
            </Typography>

            {message.text && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <form noValidate onSubmit={handleSubmit}>
              <TextField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleChange}
                fullWidth
                margin="normal"
              />

              {/* Password Field with toggle */}
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                fullWidth
                margin="normal"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              <Typography
                variant="body2"
                sx={{ mt: 1, mb: 2, color: '#648E87', textAlign: 'right', cursor: 'pointer' }}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Typography>

              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, backgroundColor: '#648E87' }}>
                Login
              </Button>
            </form>

            <Typography 
              variant="body2"
              sx={{ mt: 2}}>
              Don't have an account yet?
              <Box
                component="span"
                sx={{ color: '#648E87', cursor: 'pointer' }}
                onClick={() => navigate('/register')}
              >
                 Register
              </Box>
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
