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

const AboutUsSection = () => {
  const [aboutData, setAboutData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    content: '',
    aboutImage: null,
  });
  const [message, setMessage] = useState('');

  // Fetch existing About Us data on mount
  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-about`);
        if (res.data.length > 0) {
          const about = res.data[0];
          setAboutData({
            id: about.id,
            title: about.title,
            content: about.content,
            imageUrl: `${BASE_URL}/uploads/about/${about.about_image}`,
          });
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };

    fetchAbout();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, aboutImage: file }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (form.aboutImage) {
        formData.append('about_image', form.aboutImage);
      }

      const res = await axios.post(`${BASE_URL}/api/admin/add-about`, formData);

      const imageUrl = form.aboutImage
        ? URL.createObjectURL(form.aboutImage)
        : aboutData?.imageUrl;

      setAboutData({
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
        alt="About"
        width="120"
        height="80"
        style={{ objectFit: 'cover', borderRadius: 6 }}
      />
    ) : '—';

  const openModal = () => {
    setForm({
      title: aboutData?.title || '',
      content: aboutData?.content || '',
      aboutImage: null,
    });
    setModalOpen(true);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">About Us Section</Typography>
        <Button variant="contained" onClick={openModal}>
          {aboutData ? 'Edit About Info' : 'Add About Info'}
        </Button>
      </Box>

      {message && <Typography sx={{ mt: 2, color: 'green' }}>{message}</Typography>}

      {aboutData && (
        <Box mt={3}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: 160 }}>Title</TableCell>
                <TableCell>{aboutData.title}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Content</TableCell>
                <TableCell>{aboutData.content}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>About Image</TableCell>
                <TableCell>{renderImagePreview(aboutData.imageUrl)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
``
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{aboutData ? 'Edit About Us Info' : 'Add About Us Info'}</DialogTitle>
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
                Upload About Image
              </Typography>
              <Button variant="contained" component="label" sx={{ width: '100%' }}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {form.aboutImage && (
                <Box mt={1}>
                  <img
                    src={URL.createObjectURL(form.aboutImage)}
                    alt="About Preview"
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

export default AboutUsSection;
