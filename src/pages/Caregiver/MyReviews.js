import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Rating,
  Avatar,
  Divider,
  Paper,
  Container,
  Skeleton,
  Chip,
  Stack,
  alpha
} from '@mui/material';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  PersonOutline as PersonIcon,
  CalendarToday as CalendarIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MyReviews = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/caregivers/caregiver-reviews/${caregiverId}`);
        setReviews(res.data);
        
        // Calculate statistics
        if (res.data.length > 0) {
          const total = res.data.length;
          const sum = res.data.reduce((acc, review) => acc + review.rating, 0);
          const avg = sum / total;
          
          const distribution = {
            5: 0,
            4: 0,
            3: 0,
            2: 0,
            1: 0
          };
          
          res.data.forEach(review => {
            distribution[review.rating] = (distribution[review.rating] || 0) + 1;
          });
          
          setStats({
            averageRating: avg,
            totalReviews: total,
            ratingDistribution: distribution
          });
        }
      } catch (err) {
        console.error('Error fetching caregiver reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    if (caregiverId) {
      fetchReviews();
    }
  }, [caregiverId]);

  // Get rating percentage for distribution bar
  const getRatingPercentage = (rating) => {
    if (stats.totalReviews === 0) return 0;
    return (stats.ratingDistribution[rating] / stats.totalReviews) * 100;
  };

  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700,
              background: 'linear-gradient(135deg, #648E87 0%, #4a6b65 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            My Reviews
          </Typography>
          <Typography variant="body1" sx={{ color: '#6c757d' }}>
            See what clients are saying about your service
          </Typography>
        </Box>

        {/* Stats Cards */}
        {!loading && reviews.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Card sx={{ 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack 
                  direction={{ xs: 'column', md: 'row' }} 
                  spacing={4}
                  alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                  {/* Average Rating Circle */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', display: 'inline-block' }}>
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: '50%',
                          background: `conic-gradient(#648E87 0deg ${(stats.averageRating / 5) * 360}deg, #e0e0e0 ${(stats.averageRating / 5) * 360}deg)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Box
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: 'white',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Typography variant="h3" sx={{ fontWeight: 700, color: '#648E87' }}>
                            {stats.averageRating.toFixed(1)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#6c757d' }}>
                            out of 5
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1, color: '#6c757d' }}>
                      {stats.totalReviews} {stats.totalReviews === 1 ? 'review' : 'reviews'}
                    </Typography>
                  </Box>

                  {/* Rating Distribution */}
                  <Box sx={{ flex: 1, width: '100%' }}>
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <Box key={rating} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                        <Box sx={{ minWidth: 60, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>{rating}</Typography>
                          <StarIcon sx={{ fontSize: 16, color: '#ffc107' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              height: 8,
                              backgroundColor: '#e0e0e0',
                              borderRadius: 4,
                              overflow: 'hidden'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${getRatingPercentage(rating)}%`,
                                height: '100%',
                                backgroundColor: '#648E87',
                                borderRadius: 4,
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ color: '#6c757d', minWidth: 45 }}>
                          {stats.ratingDistribution[rating]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Reviews List */}
        {loading ? (
          // Loading Skeletons
          <Box>
            {[1, 2, 3].map((item) => (
              <Card key={item} sx={{ mb: 2, borderRadius: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box sx={{ flex: 1 }}>
                      <Skeleton variant="text" width={200} height={28} />
                      <Skeleton variant="text" width={100} height={20} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="100%" height={60} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : reviews.length > 0 ? (
          <Box>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#2c3e50' }}>
              Recent Reviews
            </Typography>
            {reviews.map((review, index) => (
              <Card 
                key={index} 
                sx={{ 
                  mb: 2, 
                  borderRadius: 3,
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: alpha('#648E87', 0.1),
                          color: '#648E87',
                          width: 48,
                          height: 48
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                          {review.user_name || 'Anonymous Client'}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                          <Rating 
                            value={review.rating} 
                            readOnly 
                            size="small"
                            icon={<StarIcon fontSize="inherit" />}
                            emptyIcon={<StarBorderIcon fontSize="inherit" />}
                            sx={{ color: '#ffc107' }}
                          />
                          <Typography variant="caption" sx={{ color: '#6c757d' }}>
                            {review.rating}.0
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Chip
                      icon={<CalendarIcon sx={{ fontSize: 14 }} />}
                      label={new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                      size="small"
                      sx={{ 
                        backgroundColor: alpha('#648E87', 0.1),
                        color: '#648E87',
                        fontWeight: 500
                      }}
                    />
                  </Box>

                  {review.comment && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <CommentIcon sx={{ fontSize: 20, color: '#648E87', opacity: 0.7 }} />
                        <Typography variant="body1" sx={{ color: '#495057', lineHeight: 1.6 }}>
                          {review.comment}
                        </Typography>
                      </Box>
                    </>
                  )}
                  
                  {!review.comment && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#648E87', 0.05), borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ color: '#6c757d', fontStyle: 'italic' }}>
                        No comment provided
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          // Empty State
          <Paper 
            sx={{ 
              p: 6, 
              textAlign: 'center', 
              borderRadius: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}
          >
            <Box sx={{ mb: 2 }}>
              <StarBorderIcon sx={{ fontSize: 64, color: '#648E87', opacity: 0.5 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#2c3e50', mb: 1 }}>
              No Reviews Yet
            </Typography>
            <Typography variant="body2" sx={{ color: '#6c757d', maxWidth: 400, mx: 'auto' }}>
              You haven't received any reviews yet. Once clients start reviewing your service, they'll appear here.
            </Typography>
          </Paper>
        )}
      </Container>
    </DashboardLayout>
  );
};

export default MyReviews;