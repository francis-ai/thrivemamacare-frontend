// src/components/admin/FounderSection.js
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const FounderSection = () => {
  const [founderData, setFounderData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    founderImage: null,
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchFounder = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-founder`);
        if (res.data.length > 0) {
          const founder = res.data[0];
          setFounderData({
            id: founder.id,
            title: founder.title,
            content: founder.content,
            imageUrl: `${BASE_URL}/uploads/founder/${founder.founder_image}`,
          });
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };

    fetchFounder();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, founderImage: file }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (form.founderImage) {
        formData.append('founder_image', form.founderImage);
      }

      const res = await axios.post(`${BASE_URL}/api/admin/add-founder`, formData);

      const imageUrl = form.founderImage
        ? URL.createObjectURL(form.founderImage)
        : founderData?.imageUrl;

      setFounderData({
        title: form.title,
        content: form.content,
        imageUrl,
      });

      setMessage(res.data.message || 'Saved successfully');
      setModalOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  const renderImagePreview = (url) =>
    url ? (
      <img
        src={url}
        alt="Founder"
        width="120"
        height="80"
        style={{ objectFit: 'cover', borderRadius: 6 }}
      />
    ) : '—';

  const openModal = () => {
    setForm({
      title: founderData?.title || '',
      content: founderData?.content || '',
      founderImage: null,
    });
    setModalOpen(true);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Meet the Founder Section</Typography>
        <Button variant="contained" onClick={openModal}>
          {founderData ? 'Edit Founder Info' : 'Add Founder Info'}
        </Button>
      </Box>

      {message && <Typography sx={{ mt: 2, color: 'green' }}>{message}</Typography>}

      {founderData && (
        <Box mt={3}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Title</TableCell>
                <TableCell>{founderData.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell>{founderData.content}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Founder Image</TableCell>
                <TableCell>{renderImagePreview(founderData.imageUrl)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{founderData ? 'Edit Founder Info' : 'Add Founder Info'}</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              width: '100%',
              mt: 1,
            }}
          >
            <TextField
              name="title"
              label="Title"
              value={form.title}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              multiline
              rows={5}
              name="content"
              label="Content"
              value={form.content}
              onChange={handleChange}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Upload Founder Image
              </Typography>
              <Button variant="contained" component="label" sx={{ width: '100%' }}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {form.founderImage && (
                <Box mt={1}>
                  <img
                    src={URL.createObjectURL(form.founderImage)}
                    alt="Founder Preview"
                    style={{ maxHeight: 120, marginTop: 8 }}
                  />
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>Save</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FounderSection;
