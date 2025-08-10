import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';

const issueTypes = ['Technical', 'Billing', 'Account', 'Others'];
const BASE_URL = process.env.REACT_APP_BASE_URL;

const Support = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [tickets, setTickets] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [issueType, setIssueType] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successOpen, setSuccessOpen] = useState(false);
  const [reply, setReply] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch real tickets
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/auth/get-support-tickets?user_id=${caregiverId}&user_type=caregiver`
        );
        const data = await res.json();
        if (data.success) {
          const formatted = data.tickets.map((ticket) => ({
            id: ticket.id,
            subject: ticket.subject,
            status: ticket.status,
            type: ticket.type,
            date: new Date(ticket.created_at).toISOString().split('T')[0],
            messages: ticket.messages.map((m) => ({
              message: m.message,
              sender_type: m.sender_type,
              created_at: m.created_at,
            })),
            caregiverId,
          }));
          setTickets(formatted);
        }
      } catch (err) {
        console.error('Error fetching support tickets:', err);
      }
    };

    if (caregiverId) {
      fetchTickets();
    }
  }, [caregiverId]);

  const handleSubmitTicket = async () => {
    const payload = {
      user_id: caregiverId,
      user_type: 'caregiver',
      subject: newSubject,
      type: issueType,
      message: newMessage,
    };

    try {
      const response = await fetch(`${BASE_URL}/api/auth/submit-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        const newTicket = {
          id: data.ticket_id,
          subject: newSubject,
          status: 'Open',
          date: new Date().toISOString().split('T')[0],
          messages: [newMessage],
          type: issueType,
          caregiverId,
        };
        setTickets([newTicket, ...tickets]);
        setOpenDialog(false);
        setNewSubject('');
        setNewMessage('');
        setIssueType('');
        setSuccessOpen(true);
      } else {
        alert(data.error || 'Failed to submit ticket');
      }
    } catch (err) {
      console.error('Error submitting ticket:', err);
      alert('Server error. Please try again later.');
    }
  };

  const fetchSingleTicket = async (ticketId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/support-tickets/${ticketId}?user_id=${caregiverId}&user_type=caregiver`);
      const data = await res.json();
      if (data.success) {
        setSelectedTicket(data.ticket);
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
    }
  };


  const handleSendMessage = async (msg) => {
    if (!msg || !selectedTicket || selectedTicket.status !== 'Open') return;

    try {
      const res = await fetch(
        `${BASE_URL}/api/auth/support-tickets/${selectedTicket.id}/reply?user_id=${caregiverId}&user_type=caregiver`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ message: msg })
        }
      );

      if (res.ok) {
        setReply(''); // Optional: clear input if you're using a controlled TextField
        fetchSingleTicket(selectedTicket.id); // Refresh ticket with latest messages
      } else {
        console.error('Failed to send message', reply);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <DashboardLayout>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          height: isMobile ? 'auto' : '80vh',
        }}
      >
        <Box
          sx={{
            width: isMobile ? '100%' : '30%',
            borderRight: isMobile ? 'none' : '1px solid #ccc',
            borderBottom: isMobile ? '1px solid #ccc' : 'none',
            maxHeight: isMobile ? '40vh' : 'auto',
            overflowY: 'auto',
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            <Typography variant="h6">Support Tickets</Typography>
            <Button
              variant="contained"
              onClick={() => setOpenDialog(true)}
              sx={{ backgroundColor: '#648E87' }}
            >
              New
            </Button>
          </Box>
          <List>
            {tickets.map((ticket) => (
              <ListItem
                button
                key={ticket.id}
                selected={selectedTicket?.id === ticket.id}
                onClick={() => setSelectedTicket(ticket)}
              >
                <ListItemText
                  primary={ticket.subject}
                  secondary={`${ticket.status} | ${ticket.date}`}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedTicket ? (
            <>
              <Typography variant="h6" mb={2}>
                {selectedTicket.subject}
              </Typography>
              <Paper sx={{ flex: 1, p: 2, overflowY: 'auto', mb: 2, maxHeight: '40vh' }}>
                {selectedTicket.messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    mb={1}
                    sx={{
                      backgroundColor: msg.sender_type === 'admin' ? '#e6f4ea' : 'whitesmoke',
                      padding: 1.5,
                      borderRadius: 1,
                    }}
                  >
                    <Typography variant="caption" color="textSecondary" fontWeight={600}>
                      {msg.sender_type === 'admin' ? 'Admin' : 'You'}
                    </Typography>
                    <Typography variant="body2">{msg.message}</Typography>
                  </Box>
                ))}
              </Paper>
              <TextField
                placeholder="Type your message..."
                fullWidth
                disabled={selectedTicket.status !== 'Open'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSendMessage(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
            </>
          ) : (
            <Typography variant="body1">Select a ticket to view conversation</Typography>
          )}
        </Box>
      </Box>

      {/* New Ticket Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Submit a New Support Ticket</DialogTitle>
        <DialogContent>
          <TextField
            label="Subject"
            fullWidth
            margin="dense"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Issue Type</InputLabel>
            <Select
              value={issueType}
              onChange={(e) => setIssueType(e.target.value)}
              label="Issue Type"
            >
              {issueTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Message"
            fullWidth
            margin="dense"
            multiline
            minRows={4}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#648E87' }}
            onClick={handleSubmitTicket}
            disabled={!newSubject || !newMessage || !issueType}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccessOpen(false)} severity="success" sx={{ width: '100%' }}>
          Ticket submitted successfully!
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Support;
