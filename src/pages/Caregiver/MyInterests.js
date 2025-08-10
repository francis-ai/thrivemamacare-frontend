import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Avatar,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';
import { deepPurple } from '@mui/material/colors';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MyInterests = () => {
  const [interestedRequests, setInterestedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const fetchInterestedRequests = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${BASE_URL}/api/caregivers/my-interests/${caregiverId}`
      );
      setInterestedRequests(res.data.interests || []);
    } catch (err) {
      console.error("Failed to fetch interests:", err);
      setError("Failed to load your interests. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [caregiverId]); // Added dependency

  useEffect(() => {
    if (caregiverId) {
      fetchInterestedRequests();
    }
  }, [caregiverId, fetchInterestedRequests]); // Now includes fetchInterestedRequests

  const handleRemoveInterest = async (requestId) => {
    try {
      await axios.post(`${BASE_URL}/api/caregivers/unshow-interest`, {
        caregiverId,
        requestId,
      });
      setInterestedRequests(prev => prev.filter(req => req.request_id !== requestId));
    } catch (err) {
      console.error("Failed to remove interest:", err);
      setError("Failed to remove interest. Please try again.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
          <Button onClick={fetchInterestedRequests} variant="outlined" sx={{ mt: 2 }}>
            Retry
          </Button>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          My Interests
        </Typography>

        {interestedRequests.length === 0 ? (
          <Box textAlign="center" mt={4}>
            <Typography variant="body1" color="textSecondary">
              You haven’t shown interest in any requests yet.
            </Typography>
            <Button 
              href="/caregiver/available-requests" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Browse Available Requests
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3} mt={1}>
            {interestedRequests.map((req) => (
              <Grid item xs={12} sm={6} md={4} key={req.request_id}>
                <Card sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: 3,
                  '&:hover': { boxShadow: 6 }
                }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" alignItems="center" mb={2}>
                      <Avatar sx={{ 
                        bgcolor: deepPurple[500], 
                        mr: 2,
                        width: 40,
                        height: 40
                      }}>
                        {req.service?.charAt(0) || 'R'}
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {req.service || 'Caregiving Request'}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Duration:</strong> {req.duration || 'Flexible'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Age Group:</strong> {req.age_group || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Location:</strong> {req.address || 'Not specified'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                      <strong>Offered Amount:</strong> {req.offer_amount || 'Not specified'}
                    </Typography>

                    <Box mt={2} display="flex" justifyContent="space-between">
                      <Chip
                        label={req.status || 'Pending'}
                        color={
                          req.status === 'Shortlisted' ? 'success' : 
                          req.status === 'Rejected' ? 'error' : 'warning'
                        }
                        size="small"
                      />
                      <Box>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleRemoveInterest(req.request_id)}
                          sx={{ mr: 1 }}
                        >
                          Remove
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyInterests;