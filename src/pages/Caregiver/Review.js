import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import {
  Box,
  TextField,
  Button,
  Typography,
  Snackbar,
  Alert,
  Rating,
  Paper,
  Card,
  CardContent,
  Stack,
} from '@mui/material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Review = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [form, setForm] = useState({
    name: '',
    review: '',
    rating: 5,
  });

  const [existingReview, setExistingReview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch user's existing review
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/auth/my-reviews/${caregiverId}/caregiver`
        );

        if (res.data.reviews.length > 0) {
          setExistingReview(res.data.reviews[0]); // Only allow one review
        }
      } catch (err) {
        console.error('Error fetching review:', err);
      }
    };

    if (caregiverId) fetchReview();
  }, [caregiverId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (event, newValue) => {
    setForm((prev) => ({ ...prev, rating: newValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.review || !form.rating) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields.',
        severity: 'error',
      });
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/submit-review`,
        {
          user_id: caregiverId,
          user_type: 'caregiver',
          name: form.name,
          review: form.review,
          rating: parseInt(form.rating),
        }
      );

      setSnackbar({
        open: true,
        message: response.data.message || 'Review submitted successfully.',
        severity: 'success',
      });

      setForm({ name: '', review: '', rating: 5 });

      // Refresh to show the submitted review
      setExistingReview({
        name: form.name,
        review: form.review,
        rating: form.rating,
      });
    } catch (error) {
      console.error('Review submission error:', error);
      setSnackbar({
        open: true,
        message: 'Something went wrong while submitting your review.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <DashboardLayout>
      <Box sx={{ maxWidth: 700, mx: 'auto', my: 4 }}>
        {existingReview ? (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                Your Submitted Review
              </Typography>
              <Stack spacing={1}>
                <Typography variant="subtitle1"><strong>Name:</strong> {existingReview.name}</Typography>
                <Typography variant="body1"><strong>Review:</strong> {existingReview.review}</Typography>
                <Box display="flex" alignItems="center">
                  <Typography variant="body1" mr={1}><strong>Rating:</strong></Typography>
                  <Rating value={parseInt(existingReview.rating)} readOnly />
                </Box>
                {/* <Typography variant="caption" color="text.secondary">
                  Status: {existingReview.status}
                </Typography> */}
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" mb={3} fontWeight="bold" color="primary">
              Submit a Review
            </Typography>

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                margin="normal"
              />

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review"
                name="review"
                value={form.review}
                onChange={handleChange}
                margin="normal"
              />

              <Box mt={2} mb={3}>
                <Typography component="legend">Rating</Typography>
                <Rating
                  name="rating"
                  value={form.rating}
                  onChange={handleRatingChange}
                  precision={1}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ py: 1.5 }}
              >
                Submit Review
              </Button>
            </form>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default Review;
