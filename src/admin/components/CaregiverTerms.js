import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Typography,
  List, ListItem, ListItemText, Divider, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function CaregiverTerms() {
  const [terms, setTerms] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Subtopic modal
  const [subOpen, setSubOpen] = useState(false);
  const [currentTermId, setCurrentTermId] = useState(null);
  const [subEditId, setSubEditId] = useState(null);
  const [subNumber, setSubNumber] = useState('');
  const [subContent, setSubContent] = useState('');

  const fetchTerms = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/caregiver-terms`);
      setTerms(res.data);
    } catch (err) {
      showSnackbar('Failed to fetch terms', 'error');
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = () => {
    setTitle('');
    setContent('');
    setEditingId(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/admin/caregiver-terms/${editingId}`, { title, content });
        showSnackbar('Term updated');
      } else {
        await axios.post(`${BASE_URL}/api/admin/caregiver-terms`, { title, content });
        showSnackbar('Term added');
      }
      fetchTerms();
      handleClose();
    } catch (err) {
      showSnackbar('Failed to submit term', 'error');
    }
  };

  const handleEdit = (term) => {
    setEditingId(term.id);
    setTitle(term.title);
    setContent(term.content);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this term?')) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/caregiver-terms/${id}`);
        fetchTerms();
        showSnackbar('Term deleted');
      } catch (err) {
        showSnackbar('Failed to delete term', 'error');
      }
    }
  };

  const handleSubOpen = (termId, sub = null) => {
    setCurrentTermId(termId);
    setSubEditId(sub?.id || null);
    setSubNumber(sub?.sub_number || '');
    setSubContent(sub?.content || '');
    setSubOpen(true);
  };

  const handleSubSubmit = async () => {
    try {
      const payload = {
        caregiver_terms_id: currentTermId,
        sub_number: subNumber,
        content: subContent,
      };

      if (subEditId) {
        await axios.put(`${BASE_URL}/api/admin/caregiver-terms-subtopic/${subEditId}`, payload);
        showSnackbar('Subtopic updated');
      } else {
        await axios.post(`${BASE_URL}/api/admin/caregiver-terms-subtopic`, payload);
        showSnackbar('Subtopic added');
      }

      fetchTerms();
      setSubOpen(false);
    } catch (err) {
      showSnackbar('Failed to submit subtopic', 'error');
    }
  };

  const handleSubDelete = async (id) => {
    if (window.confirm('Delete subtopic?')) {
      try {
        await axios.delete(`${BASE_URL}/api/admin/caregiver-terms-subtopic/${id}`);
        fetchTerms();
        showSnackbar('Subtopic deleted');
      } catch (err) {
        showSnackbar('Failed to delete subtopic', 'error');
      }
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Caregiver Term
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Term' : 'Add Term'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={subOpen} onClose={() => setSubOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{subEditId ? 'Edit Subtopic' : 'Add Subtopic'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Sub Number (e.g. 2.1)"
            fullWidth
            margin="normal"
            value={subNumber}
            onChange={(e) => setSubNumber(e.target.value)}
          />
          <TextField
            label="Content"
            fullWidth
            multiline
            rows={4}
            value={subContent}
            onChange={(e) => setSubContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubOpen(false)}>Cancel</Button>
          <Button onClick={handleSubSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <List sx={{ mt: 4 }}>
        {terms.map((term) => (
          <React.Fragment key={term.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton onClick={() => handleEdit(term)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(term.id)}><Delete /></IconButton>
                  <IconButton onClick={() => handleSubOpen(term.id)}><Add /></IconButton>
                </>
              }
            >
              <ListItemText
                primary={<Typography fontWeight="bold">{term.title}</Typography>}
                secondary={term.content}
              />
            </ListItem>

            {term.subtopics?.map((sub) => (
              <ListItem key={sub.id} sx={{ pl: 6 }}
                secondaryAction={
                  <>
                    <IconButton onClick={() => handleSubOpen(term.id, sub)}><Edit /></IconButton>
                    <IconButton onClick={() => handleSubDelete(sub.id)}><Delete /></IconButton>
                  </>
                }
              >
                <ListItemText
                  primary={<Typography>{sub.sub_number}</Typography>}
                  secondary={sub.content}
                />
              </ListItem>
            ))}

            <Divider />
          </React.Fragment>
        ))}
      </List>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
