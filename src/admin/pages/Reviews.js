import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Grid,
  Rating,
  Avatar,
  Stack,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/all-reviews`);
      setReviews(res.data.reviews); // 🔧 backend sends { success, reviews }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setSnackbar({ open: true, message: 'Failed to load reviews', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleToggleApproval = async (id, currentStatus) => {
    try {
      await axios.put(`${BASE_URL}/api/admin/review/approve/${id}`, {
        is_approved: !currentStatus,
      });

      setSnackbar({
        open: true,
        message: currentStatus ? 'Review unapproved.' : 'Review approved.',
        severity: 'success',
      });

      setReviews((prev) =>
        prev.map((review) =>
          review.id === id ? { ...review, is_approved: !currentStatus } : review
        )
      );
    } catch (error) {
      console.error('Approval toggle error:', error);
      setSnackbar({ open: true, message: 'Update failed.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" mb={3} fontWeight="bold">
        Manage Reviews
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} md={6} key={review.id}>
              <Card elevation={3}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                    <Avatar
                      src={review.profile_image || ''}
                      alt={review.name}
                      sx={{ width: 50, height: 50 }}
                    />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {review.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.user_type.toUpperCase()}
                      </Typography>
                    </Box>
                  </Stack>

                  <Rating value={review.rating} readOnly />
                  <Typography variant="body2" mt={1} mb={2}>
                    {review.review}
                  </Typography>

                  <Typography
                    variant="caption"
                    color={review.is_approved ? 'success.main' : 'error.main'}
                    fontWeight="bold"
                  >
                    Status: {review.is_approved ? 'Approved' : 'Unapproved'}
                  </Typography>

                  <Box mt={2}>
                    <Button
                      variant={review.is_approved ? 'outlined' : 'contained'}
                      color={review.is_approved ? 'warning' : 'primary'}
                      onClick={() => handleToggleApproval(review.id, review.is_approved)}
                    >
                      {review.is_approved ? 'Unapprove' : 'Approve'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Reviews;
