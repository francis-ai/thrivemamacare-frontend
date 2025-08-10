import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Pagination,
  Snackbar,
  Alert
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AdminSupport = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets`);
      const data = await res.json();
      if (data.success) {
        const normalized = data.tickets.map(ticket => ({
          ...ticket,
          messages: typeof ticket.messages === 'string' ? JSON.parse(ticket.messages || '[]') : ticket.messages || []
        }));
        setTickets(normalized);
      } else {
        console.error(data.message);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  };

  const handleOpenModal = (ticket) => {
    setSelectedTicket(ticket);
    setReply('');
    setStatus(ticket.status);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTicket(null);
    setReply('');
    setStatus('');
  };

  const handleReplySubmit = async () => {
    console.log('Sending reply:', { ticketId: selectedTicket?.id, message: reply });
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets/${selectedTicket.id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: reply })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Reply sent', severity: 'success' });
        fetchTickets();
        handleCloseModal();
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to send reply', severity: 'error' });
    }
  };

  const handleStatusUpdate = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/admin/support-tickets/${selectedTicket.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setSnackbar({ open: true, message: 'Status updated', severity: 'success' });
        fetchTickets();
        handleCloseModal();
      }
    } catch (err) {
      console.error(err);
      setSnackbar({ open: true, message: 'Failed to update status', severity: 'error' });
    }
  };

  const paginatedTickets = tickets.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3} fontWeight={600}>Support Tickets</Typography>

      {paginatedTickets.map(ticket => (
        <Paper key={ticket.id} sx={{ p: 2, mb: 2 }} elevation={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>{ticket.subject}</Typography>
              <Typography variant="body2">User ID: {ticket.user_id} ({ticket.user_type})</Typography>
            </Box>
            <Box>
              <Chip
                label={ticket.status}
                color={ticket.status === 'Open' ? 'warning' : ticket.status === 'Resolved' ? 'info' : 'success'}
                sx={{ mr: 1 }}
              />
              <Button variant="outlined" size="small" startIcon={<VisibilityIcon />} onClick={() => handleOpenModal(ticket)}>
                Open Ticket
              </Button>
            </Box>
          </Box>
        </Paper>
      ))}

      {tickets.length === 0 && (
        <Typography align="center" mt={4}>No support tickets found.</Typography>
      )}

      <Box mt={2} display="flex" justifyContent="center">
        <Pagination
          count={Math.ceil(tickets.length / rowsPerPage)}
          page={page}
          onChange={(e, val) => setPage(val)}
          color="primary"
        />
      </Box>

      {/* Ticket Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Ticket Details</DialogTitle>
        <DialogContent dividers>
          {selectedTicket && (
            <>
              <Typography><strong>User ID:</strong> {selectedTicket.user_id}</Typography>
              <Typography><strong>User Type:</strong> {selectedTicket.user_type}</Typography>
              <Typography><strong>Subject:</strong> {selectedTicket.subject}</Typography>
              <Typography><strong>Status:</strong> {selectedTicket.status}</Typography>
              <Typography sx={{ mt: 2 }}><strong>Messages:</strong></Typography>
              {selectedTicket.messages.map((msg, idx) => (
                <Box key={idx} sx={{ p: 1, backgroundColor: '#f5f5f5', mb: 1, borderRadius: 1 }}>
                  <Typography variant="body2" fontWeight={600}>{msg.sender_type}:</Typography>
                  <Typography variant="body2">{msg.message}</Typography>
                </Box>
              ))}
              <TextField
                label="Your Reply"
                multiline
                rows={4}
                fullWidth
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                sx={{ mt: 2 }}
              />
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Resolved">Resolved</MenuItem>
                  <MenuItem value="Closed">Closed</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleReplySubmit} disabled={!reply} sx={{ backgroundColor: '#648E87' }}>
            Send Reply
          </Button>
          <Button variant="outlined" onClick={handleStatusUpdate}>Update Status</Button>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminSupport;
