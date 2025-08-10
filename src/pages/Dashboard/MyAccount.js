import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Avatar,
  Stack,
  Alert,
} from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MyAccount = () => {
  const { user } = useAuthUser();
  const userId = user?.id;

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
  });

  const [preview, setPreview] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // 📦 Fetch user profile
  useEffect(() => {
    if (!user?.id) return; 

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/profile/${user.id}`);
        const userData = res.data;

        setFormData({
          fullName: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || '',
          gender: userData.gender || '',
        });

        if (userData.profile_image) {
          setPreview(`${BASE_URL}/uploads/users/${userData.profile_image}`);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchUserProfile();
  }, [user]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('user_id', userId);
      form.append('name', formData.fullName);
      form.append('phone', formData.phone);
      form.append('gender', formData.gender); // optional if you need it
      form.append('address', formData.address);
      if (previewFile) {
        form.append('profile_image', previewFile);
      }

      const res = await axios.post(`${BASE_URL}/api/users/update-profile`, form);
      setSuccessMessage(res.data.message || 'Profile updated successfully.');
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
      setSuccessMessage('');
    }
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setErrorMessage('New passwords do not match.');
      setSuccessMessage('');
      return;
    }

    try {
      const res = await axios.post(`${BASE_URL}/api/users/change-password`, {
        id: userId,
        currentPassword: passwords.current,
        newPassword: passwords.new,
      });

      setSuccessMessage(res.data.message || 'Password changed successfully.');
      setErrorMessage('');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to change password.');
      setSuccessMessage('');
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Account
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Profile Info Section */}
        <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto', mb: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Avatar
              src={preview}
              alt="Profile"
              sx={{ width: 100, height: 100, mx: 'auto' }}
            />
            <Button
              variant="outlined"
              component="label"
              sx={{ mt: 1, color: '#1a365d', borderColor: '#1a365d' }}
            >
              Upload Photo
              <input hidden type="file" onChange={handleImageChange} accept="image/*" />
            </Button>
          </Box>

          <Box component="form" onSubmit={handleProfileSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                disabled
              />
              <TextField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="">Select Gender</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{ backgroundColor: '#648E87', '&:hover': { backgroundColor: '#648E87' } }}
              >
                Save Changes
              </Button>
            </Stack>
          </Box>
        </Paper>

        {/* Password Section */}
        <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Change Password
          </Typography>
          <Box component="form" onSubmit={handlePasswordSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Current Password"
                type="password"
                name="current"
                value={passwords.current}
                onChange={handlePasswordChange}
                fullWidth
              />
              <TextField
                label="New Password"
                type="password"
                name="new"
                value={passwords.new}
                onChange={handlePasswordChange}
                fullWidth
              />
              <TextField
                label="Confirm New Password"
                type="password"
                name="confirm"
                value={passwords.confirm}
                onChange={handlePasswordChange}
                fullWidth
              />
              <Button
                variant="contained"
                type="submit"
                fullWidth
                sx={{ backgroundColor: '#648E87', '&:hover': { backgroundColor: '#648E87' } }}
              >
                Change Password
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default MyAccount;
