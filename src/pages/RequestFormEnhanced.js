import React, { useState } from 'react';
import {
  Box, Typography, Button, TextField, FormControl,
  InputLabel, Select, MenuItem, Grid, Alert,
  CircularProgress, FormGroup, FormControlLabel,
  Checkbox, Paper, Stepper, Step, StepLabel, Container
} from '@mui/material';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../context/AuthContextUser';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const RequestFormEnhanced = () => {
  const { user } = useAuthUser();
  const userId = user?.id;

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [errors, setErrors] = useState({});

  const [requestData, setRequestData] = useState({
    service: '',
    duration: '',
    address: '',
    notes: '',
    offer_amount: '',
    primary_role: '',
    accommodation_type: '',
    state: '',
  });

  const [preferences, setPreferences] = useState({
    age_range: [],
    ethnicity: 'Any',
    religion: 'Any',
  });

  const steps = ['Basic Details', 'Matching Criteria', 'Preferences'];

  const PRIMARY_ROLES = [
    'Domestic Help',
    'Nanny',
    'Special Needs Child Caregiver',
    'Housekeeper'
  ];

  const ACCOMMODATION_TYPES = ['Live-in', 'Live-out'];

  const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const ETHNICITIES = [
    'Any',
    'Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Kanuri', 'Tiv', 'Ijaw', 'Urhobo', 'Other'
  ];

  const RELIGIONS = [
    'Any',
    'Christian', 'Muslim', 'Traditional', 'Other'
  ];

  const DURATIONS = [
    'Full-time',
    'Part-time',
    '2-3 days per week',
    'Flexible',
  ];

  const handlePreferenceChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  // ================= VALIDATION =================
  const validateStep = () => {
    let newErrors = {};

    if (activeStep === 0) {
      if (!requestData.address) newErrors.address = 'Address is required';
    }

    if (activeStep === 1) {
      if (!requestData.primary_role) newErrors.primary_role = 'Required';
      if (!requestData.accommodation_type) newErrors.accommodation_type = 'Required';
      if (!requestData.state) newErrors.state = 'Required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setRequestData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is filled
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setActiveStep(prev => prev + 1);
  };

  const handleAgeRangeToggle = (range) => {
    setPreferences((prev) => ({
      ...prev,
      age_range: prev.age_range.includes(range)
        ? prev.age_range.filter((r) => r !== range)
        : [...prev.age_range, range]
    }));
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    // 🔒 FINAL VALIDATION
    if (
      !requestData.address ||
      !requestData.primary_role ||
      !requestData.accommodation_type ||
      !requestData.state
    ) {
      setErrorMessage('Please complete all required fields before submitting.');
      setLoading(false);
      return;
    }

    try {
      const formData = {
        user_id: userId,
        service: requestData.service || requestData.primary_role,
        duration: requestData.duration,
        address: requestData.address,
        notes: requestData.notes,
        offer_amount: requestData.offer_amount,

        primary_role: requestData.primary_role,
        accommodation_type: requestData.accommodation_type,
        state: requestData.state,
        preferences: {
          age_range: preferences.age_range.length > 0 ? preferences.age_range : null,
          ethnicity: preferences.ethnicity,
          religion: preferences.religion,
        }
      };

      const res = await axios.post(
        `${BASE_URL}/api/users/caregiver-request`,
        formData
      );

      setSuccessMessage(
        res.data.message ||
        'Request submitted successfully! Matching caregivers will appear on your dashboard.'
      );

      // Reset form
      setRequestData({
        service: '',
        duration: '',
        address: '',
        notes: '',
        offer_amount: '',
        primary_role: '',
        accommodation_type: '',
        state: '',
      });

      setPreferences({
        age_range: [],
        ethnicity: 'Any',
        religion: 'Any',
      });

      setActiveStep(0);

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      console.error('Error submitting request:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <DashboardLayout>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Box sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
            }}
          >
            Create Care Request
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Paper sx={{ p: { xs: 2, sm: 3, md: 4 }, borderRadius: 2 }}>
            {/* Stepper - Responsive */}
            <Box sx={{ mb: 4, overflowX: 'auto' }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  minWidth: { xs: 300, sm: 'auto' },
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.75rem', sm: '0.875rem' }
                  }
                }}
              >
                {steps.map(label => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* STEP 1 */}
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
                  Basic Service Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Select Services</InputLabel>
                      <Select
                        name="service"
                        value={requestData.service}
                        onChange={handleChange}
                        label="Select Services"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250 }}
                      >
                        <MenuItem value="">Select Services</MenuItem>
                        {PRIMARY_ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Duration</InputLabel>
                      <Select
                        name="duration"
                        value={requestData.duration}
                        onChange={handleChange}
                        label="Duration"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250 }}
                      >
                        <MenuItem value="">Select Duration</MenuItem>
                        {DURATIONS.map((dur) => (
                          <MenuItem key={dur} value={dur}>
                            {dur}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Budget/Offer Amount (₦)"
                      name="offer_amount"
                      type="number"
                      value={requestData.offer_amount}
                      onChange={handleChange}
                      placeholder="e.g., 50000 Per Month"
                      variant="outlined"
                      sx={{
                        width: 250,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location/Address *"
                      name="address"
                      value={requestData.address}
                      onChange={handleChange}
                      multiline
                      rows={2}
                      placeholder="Your full address"
                      variant="outlined"
                      error={!!errors.address}
                      helperText={errors.address}
                      sx={{
                        width: 250,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Notes"
                      name="notes"
                      value={requestData.notes}
                      onChange={handleChange}
                      multiline
                      rows={3}
                      placeholder="Any special requirements or preferences"
                      variant="outlined"
                      sx={{
                        width: 250,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#fff',
                        }
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 2 */}
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
                  Matching Criteria
                </Typography>

                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  These details help us find the perfect caregiver for you. All fields are required.
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" required error={!!errors.primary_role}>
                      <InputLabel>Type of Care Needed *</InputLabel>
                      <Select
                        name="primary_role"
                        value={requestData.primary_role}
                        onChange={handleChange}
                        label="Type of Care Needed"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250 }}
                      >
                        <MenuItem value="">Select Role</MenuItem>
                        {PRIMARY_ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.primary_role && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.primary_role}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined" required error={!!errors.accommodation_type}>
                      <InputLabel>Accommodation Type *</InputLabel>
                      <Select
                        name="accommodation_type"
                        value={requestData.accommodation_type}
                        onChange={handleChange}
                        label="Accommodation Type"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250 }}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        {ACCOMMODATION_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                            {type === 'Live-in' && ' (Nationwide)'}
                            {type === 'Live-out' && ' (Same State Only)'}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.accommodation_type && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.accommodation_type}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth variant="outlined" required error={!!errors.state}>
                      <InputLabel>Your State *</InputLabel>
                      <Select
                        name="state"
                        value={requestData.state}
                        onChange={handleChange}
                        label="Your State"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 220 }}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {NIGERIAN_STATES.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.state && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                          {errors.state}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      backgroundColor: '#f8f9fa', 
                      borderRadius: 2,
                      border: '1px solid #e9ecef'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#495057' }}>
                        Matching Rules:
                      </Typography>
                      <Box component="ul" sx={{ m: 0, pl: 2 }}>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Live-in caregivers</strong> are available nationwide
                        </Typography>
                        <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Live-out caregivers</strong> must be in your state
                        </Typography>
                        <Typography component="li" variant="body2">
                          Caregivers are matched based on role and availability first
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* STEP 3 */}
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#2c3e50' }}>
                  Caregiver Preferences
                </Typography>

                <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
                  These preferences help us rank matches better. You're not limited to these preferences.
                </Alert>

                <Grid container spacing={3}>
                  {/* Age Range */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: '#495057' }}>
                      Preferred Caregiver Age Range
                    </Typography>
                    <FormGroup row sx={{ flexWrap: 'wrap', gap: { xs: 1, sm: 0 } }}>
                      {['21-30', '31-35', '36+'].map((range) => (
                        <FormControlLabel
                          key={range}
                          control={
                            <Checkbox
                              checked={preferences.age_range.includes(range)}
                              onChange={() => handleAgeRangeToggle(range)}
                              sx={{
                                color: '#648E87',
                                '&.Mui-checked': {
                                  color: '#648E87',
                                }
                              }}
                            />
                          }
                          label={range}
                          sx={{ mr: { xs: 1, sm: 3 } }}
                        />
                      ))}
                    </FormGroup>
                  </Grid>

                  {/* Ethnicity */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Ethnicity Preference</InputLabel>
                      <Select
                        name="ethnicity"
                        value={preferences.ethnicity}
                        onChange={handlePreferenceChange}
                        label="Ethnicity Preference"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250 }}
                      >
                        {ETHNICITIES.map((eth) => (
                          <MenuItem key={eth} value={eth}>
                            {eth}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Religion */}
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel>Religion Preference</InputLabel>
                      <Select
                        name="religion"
                        value={preferences.religion}
                        onChange={handlePreferenceChange}
                        label="Religion Preference"
                        sx={{ borderRadius: 2, backgroundColor: '#fff', width: 250}}
                      >
                        {RELIGIONS.map((rel) => (
                          <MenuItem key={rel} value={rel}>
                            {rel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ 
                      p: { xs: 2, sm: 2.5 }, 
                      backgroundColor: '#f0f7f7', 
                      borderRadius: 2,
                      border: '1px solid #d4e6e2'
                    }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, color: '#648E87' }}>
                        📊 Subscription Information
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1, color: '#495057' }}>
                        • <strong>Free Plan:</strong> See up to 3 caregiver matches per request
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#495057' }}>
                        • <strong>Premium Plan:</strong> Unlimited matches and priority support
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            )}

            {/* BUTTONS */}
            <Box sx={{ 
              mt: 4, 
              display: 'flex', 
              justifyContent: 'space-between',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Button 
                onClick={handleBack} 
                disabled={activeStep === 0}
                variant="outlined"
                fullWidth={false}
                sx={{ 
                  width: { xs: '100%', sm: 'auto' },
                  borderRadius: 2,
                  borderColor: '#648E87',
                  color: '#648E87'
                }}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  fullWidth={false}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    borderRadius: 2,
                    backgroundColor: '#648E87',
                    '&:hover': {
                      backgroundColor: '#557870'
                    }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Submit Request'}
                </Button>
              ) : (
                <Button 
                  variant="contained" 
                  onClick={handleNext}
                  fullWidth={false}
                  sx={{ 
                    width: { xs: '100%', sm: 'auto' },
                    borderRadius: 2,
                    backgroundColor: '#648E87',
                    '&:hover': {
                      backgroundColor: '#557870'
                    }
                  }}
                >
                  Next
                </Button>
              )}
            </Box>
          </Paper>
        </Box>
      </Container>
    </DashboardLayout>
  );
};

export default RequestFormEnhanced;