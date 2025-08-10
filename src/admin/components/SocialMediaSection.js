import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Paper,
  Box,
  Typography,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
} from '@mui/material';
import { Edit } from '@mui/icons-material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const SocialMediaSection = () => {
  const [socials, setSocials] = useState([]);
  const [socialForm, setSocialForm] = useState({ platform: '', url: '' });
  const [editingIndex, setEditingIndex] = useState(null);
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  // Load social links on mount
  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/social`);
        setSocials(res.data);
      } catch (error) {
        console.error('Failed to fetch socials', error);
      }
    };

    fetchSocials();
  }, []);

  const handleSocialChange = (e) => {
    const { name, value } = e.target;
    setSocialForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSocial = async () => {
    try {
      if (editingIndex !== null) {
        const id = socials[editingIndex].id;
        await axios.put(`${BASE_URL}/api/admin/social/${id}`, socialForm);
        const updated = [...socials];
        updated[editingIndex] = { ...socialForm, id };
        setSocials(updated);
      } else {
        const res = await axios.post(`${BASE_URL}/api/admin/social`, socialForm);
        setSocials([...socials, { ...socialForm, id: res.data.id || Date.now() }]);
      }

      setSocialModalOpen(false);
      setSocialForm({ platform: '', url: '' });
      setEditingIndex(null);
    } catch (error) {
      console.error('Failed to save social link', error);
    }
  };

  const handleEditSocial = (index) => {
    setSocialForm(socials[index]);
    setEditingIndex(index);
    setSocialModalOpen(true);
  };

  return (
    <>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold">Social Media Links</Typography>
          <Button variant="contained" onClick={() => { setSocialModalOpen(true); setEditingIndex(null); }}>
            Add Social Link
          </Button>
        </Box>

        <Box mt={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Platform</TableCell>
                  <TableCell>URL</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {socials.length > 0 ? socials.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.platform}</TableCell>
                    <TableCell>{item.url}</TableCell>
                    <TableCell>
                      <IconButton onClick={() => handleEditSocial(index)}>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={3}>No social media links added yet.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>

      <Dialog open={socialModalOpen} onClose={() => setSocialModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{editingIndex !== null ? 'Edit Social Link' : 'Add Social Link'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              fullWidth
              name="platform"
              label="Platform"
              value={socialForm.platform}
              onChange={handleSocialChange}
            >
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube', 'TikTok'].map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              name="url"
              label="Profile URL"
              value={socialForm.url}
              onChange={handleSocialChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSocialModalOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveSocial}
            disabled={!socialForm.platform || !socialForm.url}
          >
            {editingIndex !== null ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SocialMediaSection;
