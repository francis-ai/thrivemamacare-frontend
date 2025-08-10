import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Typography,
  List, ListItem, ListItemText, Divider, Snackbar, Alert,
  FormControlLabel, Switch
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Faqs() {
  const [open, setOpen] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/faq`);
      setFaqs(res.data);
    } catch (err) {
      console.error('Failed to fetch FAQs:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setQuestion('');
    setAnswer('');
    setIsActive(true);
    setEditingId(null);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    const data = { question, answer, is_active: isActive ? 1 : 0 };
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/admin/faq/${editingId}`, data);
        showSnackbar('FAQ updated', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/admin/faq`, data);
        showSnackbar('FAQ added', 'success');
      }
      fetchFaqs();
      handleClose();
    } catch (err) {
      console.error('FAQ submit error:', err);
      showSnackbar('Failed to submit FAQ', 'error');
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq.id);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setIsActive(faq.is_active === 1);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/faq/${id}`);
      showSnackbar('FAQ deleted', 'info');
      fetchFaqs();
    } catch (err) {
      console.error('Delete error:', err);
      showSnackbar('Failed to delete FAQ', 'error');
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add FAQ
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit FAQ' : 'Add FAQ'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Question"
            fullWidth
            margin="normal"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <TextField
            label="Answer"
            multiline
            fullWidth
            rows={6}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <FormControlLabel
            control={
              <Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            }
            label="Active"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <List sx={{ mt: 4 }}>
        {faqs.map((faq) => (
          <React.Fragment key={faq.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" onClick={() => handleEdit(faq)} sx={{ color: 'blue' }}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(faq.id)} sx={{ color: 'red' }}>
                    <Delete />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={<Typography fontWeight="bold">{faq.question}</Typography>}
                secondary={<>
                  {faq.answer.slice(0, 120)}...
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Status: {faq.is_active ? 'Active' : 'Inactive'}
                  </Typography>
                </>}
              />
            </ListItem>
            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
