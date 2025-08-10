import React, { useState } from 'react';
import {
  Box,
  Button,
  Grid,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Alert,
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    category: '',
    password: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate(); // 👈 Add this

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`${BASE_URL}/api/auth/register`, form);
      setMessage({ type: 'success', text: res.data.message });
      setForm({
        name: '',
        email: '',
        phone: '',
        gender: '',
        category: '',
        password: '',
      });

      // 👇 Redirect after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Something went wrong',
      });
    }
  };

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f4f6f8',
        px: { xs: 2, sm: 4, md: 10 },
      }}
    >
      <Grid item xs={12} md={6} lg={5}>
        <Box
          sx={{
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
            marginTop: '100px',
            backgroundColor: 'white',
            p: 4,
            boxShadow: 3,
          }}
        >
          <Typography variant="h4" fontWeight="bold" mb={3} color="#648E87">
            Create Account
          </Typography>

          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          <Box component="form" noValidate autoComplete="off">
            <TextField
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ sx: { borderRadius: 0 } }}
            />

            <TextField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ sx: { borderRadius: 0 } }}
            />

            <TextField
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ sx: { borderRadius: 0 } }}
            />

            <FormControl fullWidth margin="normal">
              <FormLabel sx={{ color: '#333', mb: 1 }}>Gender</FormLabel>
              <RadioGroup
                row
                name="gender"
                value={form.gender}
                onChange={handleChange}
              >
                <FormControlLabel value="male" control={<Radio />} label="Male" />
                <FormControlLabel value="female" control={<Radio />} label="Female" />
              </RadioGroup>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <FormLabel sx={{ color: '#333', mb: 1 }}>Register As</FormLabel>
              <RadioGroup
                row
                name="category"
                value={form.category}
                onChange={handleChange}
              >
                <FormControlLabel value="user" control={<Radio />} label="Parent/Guardian" />
                <FormControlLabel value="caregiver" control={<Radio />} label="Helper" />
              </RadioGroup>
            </FormControl>

            <TextField
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              InputProps={{ sx: { borderRadius: 0 } }}
            />

            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              sx={{
                mt: 3,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#648E87',
                '&:hover': {
                  backgroundColor: '#4b6e68',
                },
                textTransform: 'none',
              }}
            >
              Register
            </Button>
          </Box>
          <Typography 
            variant="body2"
            sx={{ mt: 2}}>
            Already have an account?
            <Box
              component="span"
              sx={{ color: '#648E87', cursor: 'pointer' }}
              onClick={() => navigate('/login')}
            >
              Login
            </Box>
          </Typography>
        </Box>
      </Grid>
    </Grid>
  );
};

export default Register;
