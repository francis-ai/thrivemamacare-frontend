import React, { useState, useEffect, useCallback } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Typography,
  List, ListItem, ListItemText, Divider, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function Terms() {
  const [open, setOpen] = useState(false);
  const [terms, setTerms] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [ setDeleteDialog] = useState({ open: false, id: null });

  // Subtopic modal states
  const [subOpen, setSubOpen] = useState(false);
  const [subNumber, setSubNumber] = useState('');
  const [subContent, setSubContent] = useState('');
  const [subEditId, setSubEditId] = useState(null);
  const [currentTermId, setCurrentTermId] = useState(null);

  // Subpoint states
    const [subpointInput, setSubpointInput] = useState('');
  const [editingSubpointId, setEditingSubpointId] = useState(null);
  const [currentSubtopicId, setCurrentSubtopicId] = useState(null);

  const fetchTerms = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/terms`);
      const termsWithSubtopics = [];

      for (const term of res.data) {
        try {
          const subRes = await axios.get(`${BASE_URL}/api/admin/terms-subtopic/${term.id}`);
          const subtopicsWithPoints = await Promise.all(
            subRes.data.map(async (sub) => {
              const pointsRes = await axios.get(`${BASE_URL}/api/admin/terms-subpoint/${sub.id}`);
              return { ...sub, subpoints: pointsRes.data };
            })
          );
          termsWithSubtopics.push({ ...term, subtopics: subtopicsWithPoints });
        } catch (subErr) {
          termsWithSubtopics.push({ ...term, subtopics: [] });
        }
      }

      setTerms(termsWithSubtopics);
    } catch (err) {
      showSnackbar('Failed to fetch terms.', 'error');
    }
  }, []);

  useEffect(() => {
    fetchTerms();
  }, [fetchTerms]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpen = () => {
    setOpen(true);
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    const data = { title, content };
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/admin/terms/${editingId}`, data);
        showSnackbar('Term updated successfully.');
      } else {
        await axios.post(`${BASE_URL}/api/admin/terms`, data);
        showSnackbar('New term added.');
      }
      fetchTerms();
      handleClose();
    } catch (err) {
      showSnackbar('Error submitting term.', 'error');
    }
  };

  const handleEdit = (term) => {
    setEditingId(term.id);
    setTitle(term.title);
    setContent(term.content);
    setOpen(true);
  };

  const confirmDelete = (id) => {
    setDeleteDialog({ open: true, id });
  };

  
  const handleSubOpen = (termId, sub = null) => {
    setSubOpen(true);
    setCurrentTermId(termId);
    setSubEditId(sub?.id || null);
    setSubNumber(sub?.sub_number || '');
    setSubContent(sub?.content || '');
  };

  const handleSubSubmit = async () => {
    const data = {
      terms_id: currentTermId,
      sub_number: subNumber,
      content: subContent,
    };

    try {
      if (subEditId) {
        await axios.put(`${BASE_URL}/api/admin/terms-subtopic/${subEditId}`, data);
        showSnackbar('Subtopic updated.');
      } else {
        await axios.post(`${BASE_URL}/api/admin/terms-subtopic`, data);
        showSnackbar('Subtopic added.');
      }
      fetchTerms();
      setSubOpen(false);
    } catch (err) {
      showSnackbar('Subtopic error.', 'error');
    }
  };

  const handleSubDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/terms-subtopic/${id}`);
      fetchTerms();
      showSnackbar('Subtopic deleted.');
    } catch (err) {
      showSnackbar('Failed to delete subtopic.', 'error');
    }
  };

  const handleSubpointSubmit = async () => {
    try {
      if (editingSubpointId) {
        await axios.put(`${BASE_URL}/api/admin/terms-subpoint/${editingSubpointId}`, { point: subpointInput });
        showSnackbar('Subpoint updated.');
      } else {
        await axios.post(`${BASE_URL}/api/admin/terms-subpoint`, {
          subtopic_id: currentSubtopicId,
          point: subpointInput,
        });
        showSnackbar('Subpoint added.');
      }
      fetchTerms();
      setSubpointInput('');
      setEditingSubpointId(null);
    } catch (err) {
      showSnackbar('Subpoint error.', 'error');
    }
  };

  const handleSubpointDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/terms-subpoint/${id}`);
      fetchTerms();
      showSnackbar('Subpoint deleted.');
    } catch (err) {
      showSnackbar('Failed to delete subpoint.', 'error');
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Term
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
            multiline
            fullWidth
            rows={10}
            variant="outlined"
            label="Content"
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

      <Dialog open={subOpen} onClose={() => setSubOpen(false)} fullWidth maxWidth="md">
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
            multiline
            fullWidth
            rows={6}
            value={subContent}
            onChange={(e) => setSubContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubOpen(false)}>Cancel</Button>
          <Button onClick={handleSubSubmit} variant="contained" color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      <List sx={{ mt: 4 }}>
        {terms.map((term) => (
          <React.Fragment key={term.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton onClick={() => handleEdit(term)} sx={{ color: 'blue' }}><Edit /></IconButton>
                  <IconButton onClick={() => confirmDelete(term.id)} sx={{ color: 'red' }}><Delete /></IconButton>
                  <IconButton onClick={() => handleSubOpen(term.id)} sx={{ color: 'green' }}><Add /></IconButton>
                </>
              }
            >
              <ListItemText
                primary={<Typography fontWeight="bold">{term.title}</Typography>}
                secondary={term.content.slice(0, 100) + '...'}
              />
            </ListItem>
            {term.subtopics?.map((sub) => (
              <React.Fragment key={sub.id}>
                <ListItem sx={{ pl: 6 }}
                  secondaryAction={
                    <>
                      <IconButton onClick={() => handleSubOpen(term.id, sub)}><Edit /></IconButton>
                      <IconButton onClick={() => handleSubDelete(sub.id)} color="error"><Delete /></IconButton>
                    </>
                  }
                >
                  <ListItemText
                    primary={<Typography>{sub.sub_number}</Typography>}
                    secondary={sub.content}
                  />
                </ListItem>
                {sub.subpoints?.map((point) => (
                  <ListItem key={point.id} sx={{ pl: 10 }}>
                    <ListItemText primary={`- ${point.point}`} />
                    <IconButton onClick={() => {
                      setEditingSubpointId(point.id);
                      setSubpointInput(point.point);
                      setCurrentSubtopicId(sub.id);
                    }}><Edit /></IconButton>
                    <IconButton onClick={() => handleSubpointDelete(point.id)} color="error"><Delete /></IconButton>
                  </ListItem>
                ))}
                <ListItem sx={{ pl: 10 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Add subpoint"
                    value={subpointInput}
                    onChange={(e) => setSubpointInput(e.target.value)}
                  />
                  <Button onClick={() => {
                    setCurrentSubtopicId(sub.id);
                    handleSubpointSubmit();
                  }}>Save</Button>
                </ListItem>
              </React.Fragment>
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
          variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
