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
import { useLocation, useNavigate } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LockIcon from '@mui/icons-material/Lock';

const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Caregiver Matches Display Component
 * Shows matching caregivers for a specific request
 * Only accessible to users with "One-time access" or "All-Inclusive Bundle" subscriptions
 */
const ViewMatches = () => {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const location = useLocation();
  const userId = user?.id;

  const queryParams = new URLSearchParams(location.search);
  const emailRequestId = Number(queryParams.get('requestId')) || null;
  const emailMatchId = Number(queryParams.get('matchId')) || null;

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
  const [openedMatchFromEmail, setOpenedMatchFromEmail] = useState(false);
  const [userPlan, setUserPlan] = useState(null);
  const [hasAccessToMatches, setHasAccessToMatches] = useState(false);
  const [planLoading, setPlanLoading] = useState(true);

  const parseRequestPreferences = (preferences) => {
    if (!preferences) return {};
    if (typeof preferences === 'object') return preferences;

    try {
      return JSON.parse(preferences);
    } catch {
      return {};
    }
  };

  console.log("User Plan", userPlan?.currentPlan)

  // Check if user has access to View Matches (Only paid subscriptions: "One-time access" or "All-Inclusive Bundle")
  useEffect(() => {
    if (!userId) {
      setPlanLoading(false);
      return;
    }

    const checkSubscription = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/subscriptions/user-plan/${userId}`);
        const currentPlan = res.data.currentPlan || 'free plan';
        setUserPlan(res.data);

        // Check if plan is a paid plan
        const isPaidPlan =
          currentPlan.toLowerCase().includes('one-time') ||
          currentPlan.toLowerCase().includes('all-inclusive') ||
          currentPlan.toLowerCase().includes('bundle');

        setHasAccessToMatches(isPaidPlan);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
        setHasAccessToMatches(false);
      } finally {
        setPlanLoading(false);
      }
    };

    checkSubscription();
  }, [userId]);

  // Fetch user requests
  useEffect(() => {
    if (!userId) return;

    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/my-caregiver-requests/${userId}`);
        setRequests(res.data.requests || []);
        if (res.data.requests && res.data.requests.length > 0) {
          const fromEmailRequest = emailRequestId
            ? res.data.requests.find((req) => req.id === emailRequestId)
            : null;

          const initialRequest = fromEmailRequest || res.data.requests[0];
          setSelectedRequest(initialRequest);
          setRequestId(initialRequest.id);
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Failed to load your requests');
      }
    };

    fetchRequests();
  }, [userId, emailRequestId]);

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

  useEffect(() => {
    if (!emailMatchId || openedMatchFromEmail || matches.length === 0) {
      return;
    }

    const linkedMatch = matches.find((match) => match.id === emailMatchId);
    if (linkedMatch) {
      setSelectedMatch(linkedMatch);
      setDetailsOpen(true);
      setOpenedMatchFromEmail(true);
    }
  }, [emailMatchId, openedMatchFromEmail, matches]);

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

  // Show loading state while checking subscription
  if (planLoading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  // Access denied UI for users without paid subscription
  if (!hasAccessToMatches) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Alert severity="warning" sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LockIcon />
              <Typography variant="h6">Premium Feature</Typography>
            </Box>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Access to View Matches is available only to users with an active subscription.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Choose either <strong>"One-Time Access"</strong> or <strong>"All-Inclusive Bundle"</strong> to unlock this premium feature and start matching with caregivers.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/subscription')}
              sx={{ mt: 1 }}
            >
              Upgrade My Plan
            </Button>
          </Alert>

          <Card sx={{ p: 3, textAlign: 'center' }}>
            <LockIcon sx={{ fontSize: 60, color: '#648E87', mb: 2 }} />
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              View Matches is Locked
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Unlock this feature to browse through matched caregivers and find the perfect helper for your needs.
            </Typography>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  // Normal render (user has access)

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
        {emailRequestId && (
          <Alert severity="info" sx={{ mb: 2 }}>
            You opened this page from a match recommendation email. Review the match and choose to approve or reject.
          </Alert>
        )}

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
                                label={`${match.match_score ?? match.score ?? 0} pts`}
                                color="primary"
                                variant="outlined"
                                size="small"
                              />
                              {(match.match_score ?? match.score ?? 0) >= 120 && (
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
                                  {parseRequestPreferences(selectedRequest.preferences).ethnicity &&
                                    parseRequestPreferences(selectedRequest.preferences).ethnicity !== 'Any' && (
                                    <Chip
                                      size="small"
                                      label={`${parseRequestPreferences(selectedRequest.preferences).ethnicity}`}
                                      variant="outlined"
                                    />
                                  )}
                                  {parseRequestPreferences(selectedRequest.preferences).religion &&
                                    parseRequestPreferences(selectedRequest.preferences).religion !== 'Any' && (
                                    <Chip
                                      size="small"
                                      label={`${parseRequestPreferences(selectedRequest.preferences).religion}`}
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
