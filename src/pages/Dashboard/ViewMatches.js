import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Avatar,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Caregiver Matches Display Component
 * Shows matching caregivers for a specific request
 */
const ViewMatches = () => {
  const { user } = useAuthUser();
  const userId = user?.id;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Fetch user requests
  useEffect(() => {
    if (!userId) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/my-requests/${userId}`);
        setRequests(res.data.requests || []);
        if (res.data.requests && res.data.requests.length > 0) {
          setSelectedRequest(res.data.requests[0]);
          setRequestId(res.data.requests[0].id);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load your requests');
      }
    };

    fetchRequests();
  }, [userId]);

  // Fetch matches for selected request
  useEffect(() => {
    if (!userId || !requestId) {
      setLoading(false);
      return;
    }

    const fetchMatches = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await axios.get(
          `${BASE_URL}/api/matches/request/${requestId}/matches/${userId}`
        );

        setMatches(res.data.matches || []);
        if (res.data.matches.length === 0) {
          setError('No matches found yet. Check back soon!');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [userId, requestId]);

  const handleRequestChange = (request) => {
    setSelectedRequest(request);
    setRequestId(request.id);
  };

  const handleSelectMatch = async (match) => {
    setLoading(true);

    try {
      await axios.post(
        `${BASE_URL}/api/matches/select/${userId}`,
        { matchId: match.id }
      );

      setSuccessMessage('Match accepted! Notifications sent to both parties.');
      setTimeout(() => {
        setSuccessMessage('');
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Error selecting match:', err);
      setError(err.response?.data?.message || 'Failed to select match');
    } finally {
      setLoading(false);
      setDetailsOpen(false);
    }
  };

  const handleRejectMatch = async (matchId) => {
    try {
      await axios.post(`${BASE_URL}/api/matches/reject`, { matchId });
      setMatches(matches.filter((m) => m.id !== matchId));
      setDetailsOpen(false);
    } catch (err) {
      console.error('Error rejecting match:', err);
    }
  };

  // Split matches into viewed and accepted
  const viewedMatches = matches.filter((m) => m.status === 'Viewed' || m.status === 'Generated');
  const acceptedMatches = matches.filter((m) => m.status === 'Accepted');

  if (!userId) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Please log in to view matches
          </Typography>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#648E87', mb: 1 }}>
            Your Caregiver Matches
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Browse through matched caregivers and select your preferred helper
          </Typography>
        </Box>

        {/* Messages */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {/* Request Selector */}
        {requests.length > 0 && (
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 2 }}>
              Select a Request to View Matches:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {requests.map((req) => (
                <Chip
                  key={req.id}
                  label={req.primary_role || req.service || `Request #${req.id}`}
                  onClick={() => handleRequestChange(req)}
                  color={selectedRequest?.id === req.id ? 'primary' : 'default'}
                  variant={selectedRequest?.id === req.id ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Paper>
        )}

        {/* Request Details */}
        {selectedRequest && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Request Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Type of Care: <strong>{selectedRequest.primary_role || selectedRequest.service}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Accommodation: <strong>{selectedRequest.accommodation_type}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Location: <strong>{selectedRequest.state || selectedRequest.address}</strong>
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Budget: <strong>₦{selectedRequest.offer_amount}</strong>
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Tabs for Available and Accepted Matches */}
        {matches.length > 0 && <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 2 }}>
          <Tab label={`📋 Available Matches (${viewedMatches.length})`} />
          <Tab label={`✅ Accepted Matches (${acceptedMatches.length})`} />
        </Tabs>}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Matches Grid */}
        {!loading && (
          <>
            {/* Available Matches Tab */}
            {activeTab === 0 && (
              <>
                {viewedMatches.length > 0 ? (
                  <Grid container spacing={2}>
                    {viewedMatches.map((match) => (
                      <Grid item xs={12} sm={6} md={4} key={match.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            cursor: 'pointer',
                            transition: 'all 0.3s',
                            '&:hover': {
                              boxShadow: '0 8px 16px rgba(100, 142, 135, 0.2)',
                              transform: 'translateY(-4px)',
                            },
                          }}
                          onClick={() => {
                            setSelectedMatch(match);
                            setDetailsOpen(true);
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            {/* Match Score Badge */}
                            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Chip
                                icon={<StarIcon sx={{ color: 'gold' }} />}
                                label={`${match.score} pts`}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                              {match.score >= 120 && (
                                <Chip
                                  label="Strong Match"
                                  size="small"
                                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                                />
                              )}
                            </Box>

                            {/* Caregiver Info */}
                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                              <Avatar
                                src={match.profile_image ? `${BASE_URL}/uploads/caregivers/${match.profile_image}` : ''}
                                sx={{ width: 56, height: 56 }}
                              >
                                {match.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {match.name}
                                </Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Rating value={match.avg_rating} size="small" readOnly />
                                  <Typography variant="caption" color="textSecondary">
                                    ({match.total_reviews})
                                  </Typography>
                                </Stack>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            {/* Details */}
                            <Stack spacing={1}>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <PersonIcon sx={{ fontSize: 18, color: '#648E87' }} />
                                <Typography variant="body2">
                                  {match.primary_role}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <LocationOnIcon sx={{ fontSize: 18, color: '#648E87' }} />
                                <Typography variant="body2">
                                  {match.accommodation_type === 'Live-in' ? 'Nationwide' : match.state}
                                </Typography>
                              </Box>
                              {match.speciality && (
                                <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                                  {match.speciality}
                                </Typography>
                              )}
                            </Stack>

                            {/* Preferences Matched */}
                            {selectedRequest?.preferences && (
                              <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                                  Preferences
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                                  {selectedRequest.preferences.ethnicity !== 'Any' && (
                                    <Chip
                                      size="small"
                                      label={`${selectedRequest.preferences.ethnicity}`}
                                      variant="outlined"
                                    />
                                  )}
                                  {selectedRequest.preferences.religion !== 'Any' && (
                                    <Chip
                                      size="small"
                                      label={`${selectedRequest.preferences.religion}`}
                                      variant="outlined"
                                    />
                                  )}
                                </Box>
                              </Box>
                            )}
                          </CardContent>

                          <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                            <Button
                              variant="contained"
                              fullWidth
                              sx={{ bgcolor: '#648E87' }}
                              onClick={() => {
                                setSelectedMatch(match);
                                setDetailsOpen(true);
                              }}
                            >
                              View Details
                            </Button>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No available matches yet. Check back soon!
                    </Typography>
                  </Paper>
                )}
              </>
            )}

            {/* Accepted Matches Tab */}
            {activeTab === 1 && (
              <>
                {acceptedMatches.length > 0 ? (
                  <Grid container spacing={2}>
                    {acceptedMatches.map((match) => (
                      <Grid item xs={12} sm={6} md={4} key={match.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            border: '2px solid #4caf50',
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CheckCircleIcon sx={{ color: '#4caf50' }} />
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                                Selected
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                              <Avatar
                                src={match.profile_image ? `${BASE_URL}/uploads/caregivers/${match.profile_image}` : ''}
                                sx={{ width: 56, height: 56 }}
                              >
                                {match.name.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                  {match.name}
                                </Typography>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                  <Rating value={match.avg_rating} size="small" readOnly />
                                </Stack>
                              </Box>
                            </Box>

                            <Divider sx={{ my: 1 }} />

                            <Typography variant="body2">
                              <strong>Phone:</strong> {match.phone}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Email:</strong> {match.email}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Paper sx={{ p: 4, textAlign: 'center' }}>
                    <Typography color="textSecondary">
                      No accepted matches yet.
                    </Typography>
                  </Paper>
                )}
              </>
            )}
          </>
        )}

        {/* Match Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          {selectedMatch && (
            <>
              <DialogTitle sx={{ bgcolor: '#648E87', color: 'white' }}>
                {selectedMatch.name} - Match Details
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                {/* Avatar */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Avatar
                    src={selectedMatch.profile_image ? `${BASE_URL}/uploads/caregivers/${selectedMatch.profile_image}` : ''}
                    sx={{ width: 80, height: 80 }}
                  >
                    {selectedMatch.name.charAt(0)}
                  </Avatar>
                </Box>

                {/* Rating */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Rating value={selectedMatch.avg_rating} readOnly />
                    <Typography variant="body2">
                      {selectedMatch.avg_rating}/5 ({selectedMatch.total_reviews} reviews)
                    </Typography>
                  </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Info */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Contact Information
                </Typography>
                <Typography variant="body2">
                  <strong>Phone:</strong> {selectedMatch.phone}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {selectedMatch.email}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* Professional Details */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Professional Details
                </Typography>
                <Typography variant="body2">
                  <strong>Role:</strong> {selectedMatch.primary_role}
                </Typography>
                <Typography variant="body2">
                  <strong>Accommodation:</strong> {selectedMatch.accommodation_type}
                </Typography>
                {selectedMatch.years_of_experience && (
                  <Typography variant="body2">
                    <strong>Experience:</strong> {selectedMatch.years_of_experience} years
                  </Typography>
                )}
                {selectedMatch.speciality && (
                  <Typography variant="body2">
                    <strong>Speciality:</strong> {selectedMatch.speciality}
                  </Typography>
                )}
                {selectedMatch.salary_range && (
                  <Typography variant="body2">
                    <strong>Expected Salary:</strong> {selectedMatch.salary_range}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>Cancel</Button>
                <Button
                  onClick={() => handleRejectMatch(selectedMatch.id)}
                  color="error"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => handleSelectMatch(selectedMatch)}
                  variant="contained"
                  sx={{ bgcolor: '#648E87' }}
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Select This Caregiver'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default ViewMatches;
