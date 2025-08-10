import React, { useCallback, useState, useEffect } from 'react';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import {
  Box,
  Card,
  Typography,
  Rating,
  IconButton,
  Tooltip,
  TextField,
  Button,
  Divider,
  Grid,
  Modal,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ApprovedCaregiver = () => {
  const { user } = useAuthUser();
  const userId = user?.id;

  // State declarations
  const [caregivers, setCaregivers] = useState([]);
  const [editingCaregiverId, setEditingCaregiverId] = useState(null);
  const [editedComment, setEditedComment] = useState('');
  const [editedRating, setEditedRating] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedCaregiverId, setSelectedCaregiverId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentAmount, setCurrentAmount] = useState(0);

  // Helper functions
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  // Data fetching
  const fetchApprovedCaregivers = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/approved-caregivers/${userId}`);
      const caregiversWithReviews = await Promise.all(
        res.data.map(async (item) => {
          try {
            const reviewRes = await axios.get(
              `${BASE_URL}/api/users/caregiver-review/${userId}/${item.caregiver_id}`
            );
            return { 
              ...item, 
              amount: item.offer_amount, // Ensure offer_amount is mapped to amount
              ...reviewRes.data 
            };
          } catch (err) {
            return { 
              ...item,
              amount: item.offer_amount // Ensure offer_amount is mapped to amount
            };
          }
        })
      );
      setCaregivers(caregiversWithReviews);
    } catch (err) {
      console.error('Error fetching caregivers:', err);
      showSnackbar('Failed to fetch caregivers', 'error');
    }
  }, [userId]);

  const fetchAppointments = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/appointments/${userId}`);
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      showSnackbar('Failed to fetch appointments', 'error');
    }
  }, [userId]);

  const getAppointmentByRequestId = useCallback((requestId) => {
    return appointments.find((a) => a.request_id === requestId);
  }, [appointments]);

  useEffect(() => {
    if (userId) {
      fetchApprovedCaregivers();
      fetchAppointments();
    }
  }, [fetchApprovedCaregivers, fetchAppointments, userId]);

  // Appointment functions
  const openAppointmentModal = (caregiverId, requestId, amount) => {
    setSelectedCaregiverId(caregiverId);
    setSelectedRequestId(requestId);
    setCurrentAmount(amount || 0);
    setAppointmentDate('');
    setAppointmentTime('');
    setAppointmentModalOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!appointmentDate || !appointmentTime) {
      showSnackbar('Please select date and time', 'error');
      return;
    }

    if (!currentAmount || currentAmount <= 0) {
      showSnackbar('Invalid payment amount', 'error');
      return;
    }

    setIsProcessingPayment(true);

    try {
      const amountInKobo = Math.round(currentAmount * 100);

      const paymentHandler = window.PaystackPop.setup({
        key: 'pk_test_5624a1b37a80ce2f38d7d2da8e5d02a2a405d8de',
        email: user.email,
        amount: amountInKobo,
        currency: 'NGN',
        ref: `APP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        metadata: {
          custom_fields: [
            {
              display_name: "Caregiver ID",
              variable_name: "caregiver_id",
              value: selectedCaregiverId
            },
            {
              display_name: "Service Amount",
              variable_name: "service_amount",
              value: currentAmount
            }
          ]
        },
        callback: function(response) {
          (async () => {
            try {
              // Verify payment
              await axios.post(`${BASE_URL}/api/users/verify-payment`, {
                reference: response.reference,
                user_id: userId,
                user_type: 'user',
                email: user.email,
                amount: currentAmount
              });

              // Create appointment
              await axios.post(`${BASE_URL}/api/users/create-appointment`, {
                caregiver_id: selectedCaregiverId,
                user_id: userId,
                request_id: selectedRequestId,
                appointment_date: appointmentDate,
                appointment_time: appointmentTime,
                payment_reference: response.reference,
                amount_paid: currentAmount
              });

              showSnackbar('Payment successful! Appointment created.', 'success');
              setAppointmentModalOpen(false);
              await fetchAppointments();
            } catch (error) {
              console.error('Payment processing error:', error);
              showSnackbar(
                error.response?.data?.message || 'Payment verification failed',
                'error'
              );
            } finally {
              setIsProcessingPayment(false);
            }
          })();
        },
        onClose: function() {
          showSnackbar('Payment window closed', 'warning');
          setIsProcessingPayment(false);
        }
      });

      paymentHandler.openIframe();

    } catch (err) {
      console.error('Appointment creation error:', err);
      showSnackbar('Failed to initiate payment', 'error');
      setIsProcessingPayment(false);
    }
  };

  const handleCompleteAppointment = async (appointmentId) => {
    try {
      // Optimistic UI update
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId ? { ...a, status: 'Completed' } : a
      ));

      await axios.put(
        `${BASE_URL}/api/users/complete-appointment/${appointmentId}`,
        { status: 'Completed' }
      );

      showSnackbar('Appointment completed successfully!', 'success');
      await fetchAppointments();
    } catch (err) {
      console.error('Error completing appointment:', err);
      showSnackbar(
        err.response?.data?.message || 'Failed to complete appointment', 
        'error'
      );
      // Revert optimistic update
      setAppointments(prev => prev.map(a => 
        a.id === appointmentId ? { ...a, status: 'Scheduled' } : a
      ));
    }
  };

  // Rating functions
  const handleOpenModal = (caregiver) => {
    setSelectedCaregiver(caregiver);
    setNewRating(0);
    setNewComment('');
    setModalOpen(true);
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post(`${BASE_URL}/api/users/caregiver-review`, {
        user_id: userId,
        caregiver_id: selectedCaregiver.caregiver_id,
        rating: newRating,
        comment: newComment,
      });
      setModalOpen(false);
      fetchApprovedCaregivers();
      showSnackbar('Review submitted successfully!', 'success');
    } catch (err) {
      console.error('Error submitting review:', err);
      showSnackbar('Failed to submit review.', 'error');
    }
  };

  const handleEdit = (caregiverId, currentComment, currentRating) => {
    setEditingCaregiverId(caregiverId);
    setEditedComment(currentComment);
    setEditedRating(currentRating);
  };

  const handleSaveEdit = async (caregiverId) => {
    try {
      await axios.put(
        `${BASE_URL}/api/users/caregiver-review/${userId}/${caregiverId}`,
        { rating: editedRating, comment: editedComment }
      );
      setEditingCaregiverId(null);
      setEditedComment('');
      setEditedRating(0);
      fetchApprovedCaregivers();
      showSnackbar('Review updated successfully!', 'success');
    } catch (err) {
      console.error('Error updating review:', err);
      showSnackbar('Failed to update review.', 'error');
    }
  };

  return (
    <DashboardLayout>
      <Box p={3}>
        <Typography variant="h5" mb={3}>Approved Helpers</Typography>

        {caregivers.length === 0 ? (
          <Typography>No approved Helper found.</Typography>
        ) : (
          caregivers.map((item) => {
            const appointment = getAppointmentByRequestId(item.request_id);
            return (
              <Card 
                key={`caregiver-${item.caregiver_id}-request-${item.request_id}`}
                sx={{ mb: 3, p: 2 }}
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <img
                        src={item.caregiver_image
                          ? `${BASE_URL}/uploads/caregivers/${item.caregiver_image}`
                          : '/avatar.png'}
                        alt={item.caregiver_name}
                        width={80}
                        height={80}
                        style={{ borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <Box>
                        <Typography variant="h6">{item.caregiver_name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Helper
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={8}>
                    <Typography variant="subtitle1" gutterBottom>Request Details:</Typography>
                    <Typography><strong>Service:</strong> {item.service}</Typography>
                    <Typography><strong>Duration:</strong> {item.duration}</Typography>
                    <Typography><strong>Age Group:</strong> {item.age_group}</Typography>
                    <Typography><strong>Address:</strong> {item.address}</Typography>
                    <Typography><strong>Notes:</strong> {item.notes}</Typography>
                    <Typography><strong>Amount:</strong> ₦{item.amount?.toLocaleString()}</Typography>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Appointment Section */}
                <Box mt={2}>
                  {appointment ? (
                    <Box sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor: appointment.status === 'Completed' ? '#648E87' : 'divider',
                      borderRadius: 1,
                      backgroundColor: appointment.status === 'Completed' ? '#f0f7f5' : 'background.paper'
                    }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                        Appointment Details
                      </Typography>
                      
                      <Grid container spacing={1} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6}>
                          <Typography><strong>Date:</strong> {new Date(appointment.appointment_date).toLocaleDateString()}</Typography>
                          <Typography><strong>Time:</strong> {appointment.appointment_time}</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography>
                            <strong>Status:</strong> 
                            <Box 
                              component="span" 
                              sx={{ 
                                ml: 1,
                                color: appointment.status === 'Completed' ? '#648E87' : 'text.primary',
                                fontWeight: 'medium'
                              }}
                            >
                              {appointment.status}
                              {appointment.status === 'Completed' && ' ✓'}
                            </Box>
                          </Typography>
                        </Grid>
                      </Grid>

                      {appointment.status === 'Scheduled' && (
                        <Button
                          variant="contained"
                          sx={{ 
                            mt: 1,
                            backgroundColor: '#648E87',
                            '&:hover': { backgroundColor: '#557a72' }
                          }}
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          Mark as Completed
                        </Button>
                      )}

                      {appointment.status === 'Completed' && (
                        <Button
                          variant="contained"
                          sx={{ 
                            mt: 1,
                            backgroundColor: '#648E87',
                            '&:hover': { backgroundColor: '#557a72' }
                          }}
                          onClick={() => openAppointmentModal(item.caregiver_id, item.request_id, item.amount)}
                        >
                          Book Again
                        </Button>
                      )}
                    </Box>
                  ) : (
                    <Button
                      variant="contained"
                      sx={{ 
                        mt: 2,
                        backgroundColor: '#648E87',
                        '&:hover': { backgroundColor: '#557a72' }
                      }}
                      onClick={() => openAppointmentModal(item.caregiver_id, item.request_id, item.amount)}
                    >
                      Create New Appointment
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Rating Section */}
                <Box mt={2}>
                  {item.rating ? (
                    editingCaregiverId === item.caregiver_id ? (
                      <>
                        <Rating
                          value={editedRating}
                          onChange={(e, newValue) => setEditedRating(newValue)}
                        />
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          value={editedComment}
                          onChange={(e) => setEditedComment(e.target.value)}
                          sx={{ mt: 2 }}
                        />
                        <Button
                          startIcon={<SaveIcon />}
                          variant="contained"
                          sx={{ 
                            mt: 2,
                            backgroundColor: '#648E87',
                            '&:hover': { backgroundColor: '#557a72' }
                          }}
                          onClick={() => handleSaveEdit(item.caregiver_id)}
                        >
                          Save
                        </Button>
                      </>
                    ) : (
                      <Tooltip title={item.comment || 'No comment'}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={item.rating} readOnly />
                          <IconButton
                            onClick={() => handleEdit(item.caregiver_id, item.comment, item.rating)}
                            size="small"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Tooltip>
                    )
                  ) : (
                    <Button 
                      variant="outlined" 
                      onClick={() => handleOpenModal(item)}
                      sx={{
                        color: '#648E87',
                        borderColor: '#648E87',
                        '&:hover': { borderColor: '#557a72' }
                      }}
                    >
                      Rate this caregiver
                    </Button>
                  )}
                </Box>
              </Card>
            );
          })
        )}
      </Box>

      {/* Review Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Rate {selectedCaregiver?.caregiver_name}
          </Typography>
          <Rating
            value={newRating}
            onChange={(e, newValue) => setNewRating(newValue)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Write your comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            variant="contained"
            sx={{ 
              mt: 2,
              backgroundColor: '#648E87',
              '&:hover': { backgroundColor: '#557a72' }
            }}
            fullWidth
            onClick={handleSubmitReview}
          >
            Submit Review
          </Button>
        </Box>
      </Modal>

      {/* Appointment Modal */}
      <Modal open={appointmentModalOpen} onClose={() => setAppointmentModalOpen(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 2,
            boxShadow: 24,
            width: 400,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Book Appointment
          </Typography>
          
          <TextField
            label="Service Fee"
            value={`₦${currentAmount?.toLocaleString()}`}
            fullWidth
            disabled
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
            InputProps={{ inputProps: { min: new Date().toISOString().split('T')[0] } }}
          />
          
          <TextField
            label="Time"
            type="time"
            fullWidth
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />
          
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#648E87',
              '&:hover': { backgroundColor: '#557a72' },
              py: 1.5
            }}
            fullWidth
            onClick={handleCreateAppointment}
            disabled={!appointmentDate || !appointmentTime || isProcessingPayment || currentAmount <= 0}
          >
            {isProcessingPayment ? (
              <>
                <CircularProgress size={24} sx={{ color: 'white', mr: 2 }} />
                Processing...
              </>
            ) : (
              'Pay Now'
            )}
          </Button>
        </Box>
      </Modal>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          onClose={handleCloseSnackbar} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
};

export default ApprovedCaregiver;