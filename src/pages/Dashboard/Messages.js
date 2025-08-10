import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';

const messages = [
  { sender: 'Admin', text: 'Welcome to Thrivemama!', time: '10:00 AM' },
  { sender: 'You', text: 'Thank you!', time: '10:05 AM' },
];


const MyMessages = () => {
  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>

        <Paper
          sx={{
            display: 'flex',
            height: { xs: 'auto', md: '500px' },
            mt: 2,
            flexDirection: { xs: 'column', md: 'row' },
          }}
        >
          {/* Sidebar - Conversation List */}
          <Box
            sx={{
              width: { xs: '100%', md: '30%' },
              borderRight: { md: '1px solid #ccc' },
              borderBottom: { xs: '1px solid #ccc', md: 'none' },
              overflowY: 'auto',
              p: 2,
            }}
          >
            <List>
              <ListItem button selected>
                <ListItemText
                  primary="Admin"
                  secondary="Welcome to Thrivemama!"
                />
              </ListItem>
              <Divider />
              <ListItem button>
                <ListItemText
                  primary="Client - Mrs. Johnson"
                  secondary="Is the date confirmed?"
                />
              </ListItem>
            </List>
          </Box>

          {/* Chat Window */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#f9f9f9',
            }}
          >
            <Box sx={{ p: 2, overflowY: 'auto', flexGrow: 1 }}>
              {messages.map((msg, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'You' ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: msg.sender === 'You' ? '#648E87' : '#e0e0e0',
                      color: msg.sender === 'You' ? '#fff' : '#000',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      maxWidth: '75%',
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: 'block', textAlign: 'right', opacity: 0.7 }}
                    >
                      {msg.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid #ccc' }}>
              <TextField
                fullWidth
                placeholder="Type your message..."
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton sx={{ color: '#648E87' }}>
                      <SendIcon />
                    </IconButton>
                  ),
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default MyMessages;
