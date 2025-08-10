// ✅ OurStorySection.js
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

const OurStorySection = () => {
  const [data, setData] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', storyImage: null });
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-story`);
        if (res.data.length > 0) {
          const item = res.data[0];
          setData({
            id: item.id,
            title: item.title,
            content: item.content,
            imageUrl: `${BASE_URL}/uploads/story/${item.story_image}`,
          });
        }
      } catch (err) {
        console.error('Fetch failed:', err);
      }
    };
    fetchStory();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setForm((prev) => ({ ...prev, storyImage: file }));
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('content', form.content);
      if (form.storyImage) formData.append('story_image', form.storyImage);

      const res = await axios.post(`${BASE_URL}/api/admin/add-story`, formData);

      const imageUrl = form.storyImage ? URL.createObjectURL(form.storyImage) : data?.imageUrl;
      setData({ title: form.title, content: form.content, imageUrl });
      setMessage(res.data.message || 'Saved successfully');
      setModalOpen(false);
    } catch (error) {
      console.error('Upload failed:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  const renderImagePreview = (url) =>
    url ? <img src={url} alt="Story" width="120" height="80" style={{ objectFit: 'cover', borderRadius: 6 }} /> : '—';

  const openModal = () => {
    setForm({ title: data?.title || '', content: data?.content || '', storyImage: null });
    setModalOpen(true);
  };

  return (
    <Paper sx={{ p: 3, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h6" fontWeight="bold">Our Story Section</Typography>
        <Button variant="contained" onClick={openModal}>{data ? 'Edit Story' : 'Add Story'}</Button>
      </Box>
      {message && <Typography sx={{ mt: 2, color: 'green' }}>{message}</Typography>}
      {data && (
        <Box mt={3}>
          <Table>
            <TableBody>
              <TableRow><TableCell sx={{ width: 160 }}>Title</TableCell><TableCell>{data.title}</TableCell></TableRow>
              <TableRow><TableCell>Content</TableCell><TableCell>{data.content}</TableCell></TableRow>
              <TableRow><TableCell>Image</TableCell><TableCell>{renderImagePreview(data.imageUrl)}</TableCell></TableRow>
            </TableBody>
          </Table>
        </Box>
      )}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{data ? 'Edit Story' : 'Add Story'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', mt: 1 }}>
            <TextField name="title" label="Title" value={form.title} onChange={handleChange} fullWidth />
            <TextField multiline rows={5} name="content" label="Content" value={form.content} onChange={handleChange} fullWidth />
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Upload Story Image</Typography>
              <Button variant="contained" component="label" sx={{ width: '100%' }}>
                Upload Image
                <input type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Button>
              {form.storyImage && <Box mt={1}><img src={URL.createObjectURL(form.storyImage)} alt="Preview" style={{ maxHeight: 120 }} /></Box>}
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

export default OurStorySection;
