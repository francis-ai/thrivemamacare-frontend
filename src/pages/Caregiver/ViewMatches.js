import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Divider,
  Stack,
  Pagination,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Caregiver Matches Display Component
 * Shows all matching requests/clients for a caregiver
 */
const CaregiverViewMatches = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [page, setPage] = useState(1);
  const matchesPerPage = 6;


  // Fetch matches for this caregiver
  useEffect(() => {
    if (!caregiverId) return;

    const fetchMatches = async () => {
      setLoading(true);
      setError('');

      try {
        const res = await axios.get(
          `${BASE_URL}/api/matches/caregiver/${caregiverId}/matches`
        );

        setMatches(res.data.matches || []);
        if (res.data.matches.length === 0) {
          setError('No matches yet. Check back soon!');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [caregiverId]);

   console.log(setSuccessMessage)

  // Show only successful matches accepted by users
  const displayMatches = matches.filter((m) => m.status === 'Accepted');
  const paginatedMatches = displayMatches.slice(
    (page - 1) * matchesPerPage,
    page * matchesPerPage
  );


  if (!caregiverId) {
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
            Successful Matches
          </Typography>
          <Typography variant="body2" color="textSecondary">
            These are requests where you have been successfully matched and accepted
          </Typography>
        </Box>

        {/* Messages */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Matches Grid */}
        {!loading && displayMatches.length > 0 ? (
          <>
            <Grid container spacing={2}>
              {paginatedMatches.map((match) => (
                <Grid item xs={12} sm={6} md={4} key={match.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      border: match.status === 'Interested' ? '2px solid #4caf50' : '1px solid #eee',
                      '&:hover': {
                        boxShadow: '0 8px 16px rgba(100, 142, 135, 0.2)',
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      {/* Match Score */}
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Chip
                          label={`${match.match_score} pts`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {match.status === 'Interested' && (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Your Interest"
                            size="small"
                            sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                          />
                        )}
                      </Box>

                      {/* Client Info */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {match.user_name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Posted {new Date(match.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 1 }} />

                      {/* Request Details */}
                      <Stack spacing={1}>
                        {match.primary_role && (
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            <PersonIcon sx={{ fontSize: 18, color: '#648E87' }} />
                            <Typography variant="body2">
                              {match.primary_role}
                            </Typography>
                          </Box>
                        )}

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <BusinessIcon sx={{ fontSize: 18, color: '#648E87' }} />
                          <Typography variant="body2">
                            {match.accommodation_type}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <LocationOnIcon sx={{ fontSize: 18, color: '#648E87' }} />
                          <Typography variant="body2">
                            {match.state || 'Nationwide'}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <AttachMoneyIcon sx={{ fontSize: 18, color: '#648E87' }} />
                          <Typography variant="body2">
                            ₦{match.offer_amount}
                          </Typography>
                        </Box>
                      </Stack>

                      {/* Service and Duration */}
                      {match.service && (
                        <Box sx={{ mt: 2, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            Service: {match.service}
                          </Typography>
                        </Box>
                      )}

                      {match.duration && (
                        <Box sx={{ mt: 1, p: 1, backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                            Duration: {match.duration}
                          </Typography>
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

            {/* Pagination */}
            {displayMatches.length > matchesPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(displayMatches.length / matchesPerPage)}
                  page={page}
                  onChange={(e, newPage) => setPage(newPage)}
                />
              </Box>
            )}
          </>
        ) : (
          !loading && (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No successful matches yet.
              </Typography>
            </Paper>
          )
        )}

        {/* Match Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          {selectedMatch && (
            <>
              <DialogTitle sx={{ bgcolor: '#648E87', color: 'white' }}>
                Request Details
              </DialogTitle>
              <DialogContent sx={{ mt: 2 }}>
                {/* Client Info */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    Client: {selectedMatch.user_name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Phone:</strong> {selectedMatch.user_phone}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Email:</strong> {selectedMatch.user_email}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Request Details */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Request Information
                </Typography>

                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Type of Care
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {selectedMatch.primary_role || selectedMatch.service}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Duration
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {selectedMatch.duration}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Accommodation
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {selectedMatch.accommodation_type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Location
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {selectedMatch.state || 'Nationwide'}
                    </Typography>
                  </Box>
                </Box>

                {/* Budget */}
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#f0f7f7', borderRadius: '8px' }}>
                  <Typography variant="body2" color="textSecondary">
                    Offered Budget:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#648E87' }}>
                    ₦{selectedMatch.offer_amount}
                  </Typography>
                </Box>

                {/* Address */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                    Address
                  </Typography>
                  <Typography variant="body2">
                    {selectedMatch.address}
                  </Typography>
                </Box>

                {/* Special Notes */}
                {selectedMatch.notes && (
                  <Box sx={{ mb: 2, p: 2, backgroundColor: '#fff3e0', borderRadius: '8px' }}>
                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                      Special Requirements
                    </Typography>
                    <Typography variant="body2">
                      {selectedMatch.notes}
                    </Typography>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailsOpen(false)}>Close</Button>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Successful Match"
                  sx={{ bgcolor: '#e8f5e9', color: '#2e7d32' }}
                />
              </DialogActions>
            </>
          )}
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CaregiverViewMatches;
