import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  Pagination,
} from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Notification = () => {
  const { user } = useAuthUser();
  const userId = user?.id;
  const userType = 'user';

  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Fetch notifications from backend
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/auth/notifications/${userId}/${userType}`
      );
      const data = res.data.data || [];
      // Format date if needed
      const formatted = data.map((n) => ({
        id: n.id,
        title: n.type || 'Notification',
        content: n.message,
        date: new Date(n.created_at).toLocaleDateString(),
      }));
      setNotifications(formatted);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  }, [userId, userType]);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  useEffect(() => {
    const filtered = notifications.filter(
      (msg) =>
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredMessages(filtered);
    setPage(1);
  }, [searchTerm, notifications]);

  const handleOpenModal = (message) => {
    setSelectedMessage(message);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedMessage(null);
  };

  const paginatedMessages = filteredMessages.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          Notifications
        </Typography>

        <TextField
          label="Search messages"
          variant="outlined"
          fullWidth
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <Paper sx={{ mt: 2 }}>
          {paginatedMessages.length === 0 ? (
            <Box p={3} textAlign="center">
              <Typography variant="body1" color="text.secondary">
                No notification yet.
              </Typography>
            </Box>
          ) : (
            <List>
              {paginatedMessages.map((msg) => (
                <ListItem
                  key={msg.id}
                  button
                  onClick={() => handleOpenModal(msg)}
                  divider
                  sx={{ flexDirection: 'column', alignItems: 'flex-start' }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    {msg.title}
                  </Typography>
                  <ListItemText
                    primaryTypographyProps={{ variant: 'body2' }}
                    primary={
                      msg.content.length > 100
                        ? `${msg.content.slice(0, 100)}...`
                        : msg.content
                    }
                    secondary={msg.date}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>


        {filteredMessages.length > rowsPerPage && (
          <Box mt={2} display="flex" justifyContent="flex-end">
            <Pagination
              count={Math.ceil(filteredMessages.length / rowsPerPage)}
              page={page}
              onChange={(e, value) => setPage(value)}
              color="primary"
            />
          </Box>
        )}

        {/* Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
          <DialogTitle>{selectedMessage?.title}</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {selectedMessage?.content}
            </Typography>
            <Typography variant="caption" display="block" sx={{ mt: 2, color: 'gray' }}>
              {selectedMessage?.date}
            </Typography>
          </DialogContent>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default Notification;