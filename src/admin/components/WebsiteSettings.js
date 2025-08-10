import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const WebsiteSettings = () => {
  const [identity, setIdentity] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    site_name: '',
    caption: '',
    tagline: '',
    logo: null,
    banner1: null,
    banner2: null,
    banner3: null
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-settings`);
        const data = res.data;
        setIdentity(data);
        setForm({
          site_name: data.site_name || '',
          caption: data.caption || '',
          tagline: data.tagline || '',
          logo: null,
          banner1: null,
          banner2: null,
          banner3: null
        });
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleImageChange = (e, key) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, [key]: file }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('site_name', form.site_name);
      formData.append('caption', form.caption);
      formData.append('tagline', form.tagline);
      if (form.logo) formData.append('logo', form.logo);
      if (form.banner1) formData.append('banner1', form.banner1);
      if (form.banner2) formData.append('banner2', form.banner2);
      if (form.banner3) formData.append('banner3', form.banner3);

      await axios.post(`${BASE_URL}/api/admin/save-settings`, formData);
      setModalOpen(false);

      const res = await axios.get(`${BASE_URL}/api/admin/get-settings`);
      setIdentity(res.data);
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save settings');
    }
  };

  const renderImage = (filename) =>
    filename ? (
      <img
        src={`${BASE_URL}/uploads/website-settings/${filename}`}
        alt={filename}
        width="100"
        height="60"
        style={{ objectFit: 'cover', border: '1px solid #ccc', borderRadius: 6 }}
      />
    ) : (
      '—'
    );

  return (
    <Box mb={3}>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Website Identity</Typography>
          <Button variant="contained" onClick={() => setModalOpen(true)}>
            {identity ? 'Edit' : 'Add'}
          </Button>
        </Box>

        {identity ? (
          <Box mt={3}>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>Website Name</TableCell>
                  <TableCell>{identity.site_name}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Caption</TableCell>
                  <TableCell>{identity.caption}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tagline</TableCell>
                  <TableCell>{identity.tagline}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Logo</TableCell>
                  <TableCell>{renderImage(identity.logo)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Banner 1</TableCell>
                  <TableCell>{renderImage(identity.banner1)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Banner 2</TableCell>
                  <TableCell>{renderImage(identity.banner2)}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Banner 3</TableCell>
                  <TableCell>{renderImage(identity.banner3)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        ) : (
          <Typography mt={2}>Loading settings or no data found...</Typography>
        )}
      </Paper>

      {/* Modal Form */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{identity ? 'Edit Website Settings' : 'Add Website Settings'}</DialogTitle>
        <DialogContent>
          <Box mt={2} display="flex" flexDirection="column" gap={2}>
            <TextField
              label="Website Name"
              name="site_name"
              value={form.site_name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Caption"
              name="caption"
              value={form.caption}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              label="Tagline"
              name="tagline"
              value={form.tagline}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
            />

            {/* Image Uploads */}
            {['logo', 'banner1', 'banner2', 'banner3'].map((key) => (
              <Box key={key}>
                <Typography variant="subtitle2" gutterBottom>
                  {key === 'logo' ? 'Logo' : `Banner ${key.slice(-1)}`}
                </Typography>
                <Button variant="outlined" component="label" fullWidth>
                  Upload {key}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, key)}
                  />
                </Button>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WebsiteSettings;