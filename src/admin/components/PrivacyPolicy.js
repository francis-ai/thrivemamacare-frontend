import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, IconButton, Typography,
  List, ListItem, ListItemText, Divider, Snackbar, Alert
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function PrivacyPolicy() {
  const [open, setOpen] = useState(false);
  const [policies, setPolicies] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [subtopics, setSubtopics] = useState({});
  const [subOpen, setSubOpen] = useState(false);
  const [subTitle, setSubTitle] = useState('');
  const [subContent, setSubContent] = useState('');
  const [editingSubId, setEditingSubId] = useState(null);
  const [parentPolicyId, setParentPolicyId] = useState(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/privacy-policy`);
      setPolicies(res.data);
    } catch (err) {
      console.error('Failed to fetch privacy policies:', err);
    }
  };

  const fetchSubtopics = async (policyId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/privacy-subtopic/${policyId}`);
      setSubtopics(prev => ({ ...prev, [policyId]: res.data }));
    } catch (err) {
      console.error('Failed to fetch subtopics:', err);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setTitle('');
    setContent('');
    setEditingId(null);
  };

  const handleClose = () => setOpen(false);

  const handleSubmit = async () => {
    const data = { title, content };
    try {
      if (editingId) {
        await axios.put(`${BASE_URL}/api/admin/privacy-policy/${editingId}`, data);
        showSnackbar('Privacy policy updated successfully', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/admin/privacy-policy`, data);
        showSnackbar('Privacy policy added successfully', 'success');
      }
      fetchPolicies();
      handleClose();
    } catch (err) {
      console.error('Error submitting policy:', err);
      showSnackbar('Error submitting policy', 'error');
    }
  };

  const handleEdit = (policy) => {
    setEditingId(policy.id);
    setTitle(policy.title);
    setContent(policy.content);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/privacy-policy/${id}`);
      fetchPolicies();
      showSnackbar('Privacy policy deleted', 'info');
    } catch (err) {
      console.error('Failed to delete:', err);
      showSnackbar('Failed to delete', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenSubtopic = (policyId) => {
    setParentPolicyId(policyId);
    setSubTitle('');
    setSubContent('');
    setEditingSubId(null);
    setSubOpen(true);
  };

  const handleEditSubtopic = (sub) => {
    setEditingSubId(sub.id);
    setSubTitle(sub.title);
    setSubContent(sub.content);
    setParentPolicyId(sub.privacy_policy_id);
    setSubOpen(true);
  };

  const handleSubmitSubtopic = async () => {
    const data = { title: subTitle, content: subContent, privacy_policy_id: parentPolicyId };
    try {
      if (editingSubId) {
        await axios.put(`${BASE_URL}/api/admin/privacy-subtopic/${editingSubId}`, data);
        showSnackbar('Subtopic updated', 'success');
      } else {
        await axios.post(`${BASE_URL}/api/admin/privacy-subtopic`, data);
        showSnackbar('Subtopic added', 'success');
      }
      fetchSubtopics(parentPolicyId);
      setSubOpen(false);
    } catch (err) {
      console.error('Failed to save subtopic', err);
      showSnackbar('Failed to save subtopic', 'error');
    }
  };

  const handleDeleteSubtopic = async (id, policyId) => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/privacy-subtopic/${id}`);
      fetchSubtopics(policyId);
      showSnackbar('Subtopic deleted', 'info');
    } catch (err) {
      console.error('Delete failed', err);
      showSnackbar('Failed to delete subtopic', 'error');
    }
  };

  return (
    <>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Add New Policy
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? "Edit Privacy Policy" : "Add Privacy Policy"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Title"
            fullWidth
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Typography variant="subtitle1" gutterBottom>
            Explanation / Content
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={10}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editingId ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      <List sx={{ mt: 4 }}>
        {policies.map((policy) => (
          <React.Fragment key={policy.id}>
            <ListItem
              secondaryAction={
                <>
                  <Button size="small" onClick={() => handleOpenSubtopic(policy.id)}>+ Subtopic</Button>
                  <IconButton edge="end" onClick={() => handleEdit(policy)} sx={{ color: 'blue' }}>
                    <Edit />
                  </IconButton>
                  <IconButton edge="end" onClick={() => handleDelete(policy.id)} sx={{ color: 'red' }}>
                    <Delete />
                  </IconButton>
                </>
              }
              onClick={() => fetchSubtopics(policy.id)}
            >
              <ListItemText
                primary={<Typography fontWeight="bold">{policy.title}</Typography>}
                secondary={policy.content.slice(0, 100) + "..."}
              />
            </ListItem>

            {subtopics[policy.id]?.map((sub) => (
              <ListItem key={sub.id} sx={{ pl: 6 }}>
                <ListItemText
                  primary={<Typography variant="subtitle1">{sub.title}</Typography>}
                  secondary={sub.content.slice(0, 100) + "..."}
                />
                <IconButton edge="end" onClick={() => handleEditSubtopic(sub)} sx={{ color: 'blue' }}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDeleteSubtopic(sub.id, policy.id)} sx={{ color: 'red' }}>
                  <Delete />
                </IconButton>
              </ListItem>
            ))}

            <Divider />
          </React.Fragment>
        ))}
      </List>

      {/* Subtopic Modal */}
      <Dialog open={subOpen} onClose={() => setSubOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingSubId ? "Edit Subtopic" : "Add Subtopic"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Subtopic Title"
            fullWidth
            margin="normal"
            value={subTitle}
            onChange={(e) => setSubTitle(e.target.value)}
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
          <Button onClick={handleSubmitSubtopic} variant="contained" color="primary">
            {editingSubId ? "Update" : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

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
