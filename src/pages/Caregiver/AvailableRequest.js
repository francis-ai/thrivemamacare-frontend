import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import axios from 'axios';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AvailableRequest = () => {
  const [requests, setRequests] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingInterestId, setLoadingInterestId] = useState(null);
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch requests and interests in parallel for better performance
      const [requestsRes, interestsRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/caregivers/all-caregiver-requests`),
        axios.get(`${BASE_URL}/api/caregivers/my-interests/${caregiverId}`)
      ]);

      setRequests(requestsRes.data.requests);
      
      // Ensure we always have an array, even if the API returns undefined
      const interestedIds = interestsRes.data.interests?.map(i => i.request_id) || [];
      setInterests(interestedIds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [caregiverId]);

  useEffect(() => {
    if (caregiverId) {
      fetchRequests();
    }
  }, [caregiverId, fetchRequests]);

  const toggleInterest = async (requestId) => {
    setLoadingInterestId(requestId);
    try {
      const alreadyInterested = interests.includes(requestId);
      
      // Optimistic UI update - update state immediately while API call happens
      setInterests(prev => 
        alreadyInterested 
          ? prev.filter(id => id !== requestId) 
          : [...prev, requestId]
      );

      await axios.post(
        `${BASE_URL}/api/caregivers/${alreadyInterested ? 'unshow' : 'show'}-interest`,
        { caregiverId, requestId }
      );

      // Refresh data to ensure complete sync with backend
      await fetchRequests();
    } catch (error) {
      console.error('Error toggling interest:', error);
      // Revert optimistic update if API call fails
      setInterests(prev => 
        interests.includes(requestId) 
          ? [...prev, requestId] 
          : prev.filter(id => id !== requestId)
      );
    } finally {
      setLoadingInterestId(null);
    }
  };

  return (
    <DashboardLayout>
      <Box p={2}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Available Caregiver Requests
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" mt={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {requests.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 4 }}>No requests yet</Typography>
            ) : (
              requests.map((req) => (
                <Grid item xs={12} md={6} lg={4} key={req.id}>
                  <Card elevation={3}>
                    <CardContent>
                      <Typography variant="h6">{req.service}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Duration: {req.duration}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Age Group: {req.age_group}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Address: {req.address}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Offered Amount: {req.offer_amount}
                      </Typography>

                      <Box mt={2}>
                        <Button
                          variant={interests.includes(req.id) ? 'outlined' : 'contained'}
                          color={interests.includes(req.id) ? 'outlined' : 'primary'}
                          fullWidth
                          onClick={() => toggleInterest(req.id)}
                          disabled={loadingInterestId === req.id}
                        >
                          {loadingInterestId === req.id ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : interests.includes(req.id) ? (
                            'Interested ✓'
                          ) : (
                            'Mark Interest'
                          )}
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default AvailableRequest;