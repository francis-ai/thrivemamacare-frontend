import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Snackbar, Alert, Paper, Stack
} from '@mui/material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function ContactInfo() {
  const [info, setInfo] = useState(null);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchContact = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/contact-info`);
      setInfo(res.data);
      if (res.data) {
        setPhone(res.data.phone);
        setEmail(res.data.email);
        setAddress(res.data.address);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  useEffect(() => {
    fetchContact();
  }, []);

  const handleSubmit = async () => {
    try {
      const payload = { phone, email, address };

      if (info) {
        await axios.put(`${BASE_URL}/api/admin/contact-info`, payload);
        showSnackbar('Contact info updated');
      } else {
        await axios.post(`${BASE_URL}/api/admin/contact-info`, payload);
        showSnackbar('Contact info added');
      }

      fetchContact();
      setOpen(false);
    } catch (err) {
      showSnackbar('Error saving contact info', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Contact Information
      </Typography>

      <Paper sx={{ p: 3, my: 2 }}>
        {info ? (
          <>
            <Stack spacing={1}>
              <Typography><strong>Phone:</strong> {info.phone}</Typography>
              <Typography><strong>Email:</strong> {info.email}</Typography>
              <Typography><strong>Address:</strong> {info.address}</Typography>
            </Stack>
            <Button variant="contained" sx={{ mt: 2 }} onClick={() => setOpen(true)}>
              Edit Contact Info
            </Button>
          </>
        ) : (
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Contact Info
          </Button>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{info ? 'Edit Contact Info' : 'Add Contact Info'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            label="Email Address"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Office Address"
            fullWidth
            margin="normal"
            multiline
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {info ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
