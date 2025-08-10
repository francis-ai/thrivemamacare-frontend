import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver'; 

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MyReviews = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/caregiver-reviews/${caregiverId}`);
        setReviews(res.data);
      } catch (err) {
        console.error('Error fetching caregiver reviews:', err);
      }
    };

    if (caregiverId) {
      fetchReviews();
    }
  }, [caregiverId]);

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Reviews
        </Typography>

        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="#648E87">
                    {review.user_name || 'Client'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(review.created_at).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box mt={1} mb={1}>
                  <Rating value={review.rating} readOnly />
                </Box>

                <Typography variant="body1">{review.comment}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography variant="body1" mt={4}>
            No reviews yet.
          </Typography>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyReviews;
