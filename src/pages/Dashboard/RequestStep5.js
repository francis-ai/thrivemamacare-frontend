import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Alert,
  CircularProgress,
  Slider,
  Stack
} from '@mui/material';
import { useAuthUser } from '../../context/AuthContextUser';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const RequestStep5 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthUser();
  const userId = user?.id;

  const queryParams = new URLSearchParams(location.search);
  const service = queryParams.get('service');
  const duration = queryParams.get('duration');
  const ageGroup = queryParams.get('ageGroup');
  const address = queryParams.get('address');
  const notes = queryParams.get('notes');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [price, setPrice] = useState(5000); // Default value

  const handleSliderChange = (e, newValue) => {
    setPrice(newValue);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    if (!userId) {
      setMessage({ text: 'User not logged in.', type: 'error' });
      setLoading(false);
      return;
    }

    const requestData = {
      user_id: userId,
      service,
      duration,
      ageGroup,
      address,
      notes,
      offer_amount: price,
    };

    try {
      await axios.post(`${BASE_URL}/api/users/caregiver-request`, requestData);
      setMessage({ text: 'Request submitted successfully!', type: 'success' });

      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setMessage({
        text: error.response?.data?.message || 'Submission failed. Try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box maxWidth="600px" mx="auto" p={2}>
        <Typography variant="h5" gutterBottom>
          Step 5: Review Your Request
        </Typography>

        {message.text && (
          <Alert severity={message.type} sx={{ my: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* 💰 Price Offer Section */}
        <Box my={4}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Daily Offer (₦)
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="body2">₦1,000</Typography>
            <Slider
              value={price}
              min={1000}
              max={20000}
              step={500}
              onChange={handleSliderChange}
              valueLabelDisplay="auto"
              sx={{ flexGrow: 1 }}
            />
            <Typography variant="body2">₦20,000</Typography>
          </Stack>
          <Typography mt={1}>
            You're offering: <strong>₦{price.toLocaleString()}</strong> per day
          </Typography>
        </Box>

        {/* 📝 Review Summary */}
        <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
          <List>
            <ListItem>
              <ListItemText primary="Service Type" secondary={service} />
            </ListItem>
            <ListItem>
              <ListItemText primary="Duration" secondary={duration} />
            </ListItem>
            {ageGroup && (
              <ListItem>
                <ListItemText primary="Age Group" secondary={ageGroup} />
              </ListItem>
            )}
            <ListItem>
              <ListItemText primary="Address" secondary={address} />
            </ListItem>
            {notes && (
              <ListItem>
                <ListItemText primary="Additional Notes" secondary={notes} />
              </ListItem>
            )}
            <ListItem>
              <ListItemText
                primary="Daily Offer"
                secondary={`₦${price.toLocaleString()} per day`}
              />
            </ListItem>
          </List>
        </Paper>

        {/* 📤 Submit Button */}
        <Box mt={4}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            sx={{
              backgroundColor: '#648E87',
              px: 4,
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': { backgroundColor: '#557770' }
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Request'}
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RequestStep5;
