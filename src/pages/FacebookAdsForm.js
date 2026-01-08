import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  InputLabel,
  Select,
  MenuItem,
  Container,
  Fade,
} from '@mui/material';
import {
  CheckCircle,
} from '@mui/icons-material';
import Logo from '../assets/images/Thrivemam.png'; 


const BASE_URL = process.env.REACT_APP_BASE_URL;

const FacebookAdsForm = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    gender: '',
    category: '',
    location: '',
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const primaryColor = '#648E87';
  const accentColor = '#dd700a';

  // Embed Meta Pixel
  useEffect(() => {
    const loadFbPixel = () => {
      if (window.fbq) return;

      window.fbq = function () {
        window.fbq.callMethod
          ? window.fbq.callMethod.apply(window.fbq, arguments)
          : window.fbq.queue.push(arguments);
      };
      if (!window._fbq) window._fbq = window.fbq;
      window.fbq.push = window.fbq;
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      window.fbq.queue = [];

      const t = document.createElement('script');
      t.async = true;
      t.src = 'https://connect.facebook.net/en_US/fbevents.js';
      const s = document.getElementsByTagName('script')[0];
      s.parentNode.insertBefore(t, s);

      window.fbq('init', '25601828019505286');
      window.fbq('track', 'PageView');
    };

    loadFbPixel();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      // Prepare payload for backend
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        gender: form.gender,
        category: 'caregiver', // always send caregiver
        password: 'Thrievemama123',
      };

      await axios.post(`${BASE_URL}/api/auth/register`, payload);

      setSuccess(true);
      setMessage({ 
        type: 'success', 
        text: `✓ Registration Successful! Check your email for login details.` 
      });

      // Reset form
      setForm({
        name: '',
        email: '',
        phone: '',
        gender: '',
        category: '',
        location: '',
      });

      // Meta Pixel event
      if (window.fbq) {
        window.fbq('track', 'CompleteRegistration', {
          content_name: 'caregiver_registration',
          content_category: 'sign_up',
          currency: 'NGN',
          value: 1
        });
      }

      setTimeout(() => navigate('/application-successful'), 3000);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Fade in timeout={600}>
          <Box>
            {/* Header */}
            <Box
              sx={{
                textAlign: 'center',
                mb: 4,
              }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                {/* Logo */}
                <Box
                  component="img"
                  src={Logo}
                  alt="Thrievemama Logo"
                  sx={{
                    width: 120,
                    height: 120, 
                    mb: 2,
                    mx: 'auto',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
                <Typography variant="body1" color="text.secondary">
                  Join our team of professional caregivers
                </Typography>
              </Box>
            </Box>

            {/* Form Container */}
            <Paper
              elevation={8}
              sx={{
                width: '100%',
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                background: 'white',
                boxShadow: '0 8px 32px rgba(100, 142, 135, 0.1)',
              }}
            >
              {message.text && (
                <Alert 
                  severity={message.type} 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    borderLeft: `4px solid ${message.type === 'success' ? accentColor : '#f44336'}`,
                    '& .MuiAlert-icon': {
                      color: message.type === 'success' ? accentColor : '#f44336',
                    }
                  }}
                  icon={message.type === 'success' ? <CheckCircle /> : null}
                >
                  {message.text}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        }
                      },
                      '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: accentColor,
                          borderWidth: 2,
                        }
                      }
                    }
                  }}
                />

                {/* Email Field */}
                <TextField
                  fullWidth
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        }
                      }
                    }
                  }}
                />

                {/* Phone Field */}
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  margin="normal"
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        }
                      }
                    }
                  }}
                />

                {/* Gender Field */}
                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    mt: 2,
                    '& .MuiFormLabel-root': {
                      color: 'text.primary',
                      mb: 1,
                      fontWeight: 500,
                    }
                  }}
                >
                  <FormLabel>Gender</FormLabel>
                  <RadioGroup 
                    row 
                    name="gender" 
                    value={form.gender} 
                    onChange={handleChange}
                    sx={{ justifyContent: 'center' }}
                  >
                    <FormControlLabel 
                      value="male" 
                      control={
                        <Radio 
                          sx={{
                            color: primaryColor,
                            '&.Mui-checked': {
                              color: accentColor,
                            }
                          }}
                        />
                      } 
                      label="Male" 
                      sx={{ mr: 3 }}
                    />
                    <FormControlLabel 
                      value="female" 
                      control={
                        <Radio 
                          sx={{
                            color: primaryColor,
                            '&.Mui-checked': {
                              color: accentColor,
                            }
                          }}
                        />
                      } 
                      label="Female" 
                    />
                  </RadioGroup>
                </FormControl>

                {/* Role Field */}
                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        }
                      }
                    }
                  }}
                >
                  <InputLabel>Service Role</InputLabel>
                  <Select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    label="Service Role"
                  >
                    <MenuItem value="Nanny">Nanny</MenuItem>
                    <MenuItem value="Caregiver">Caregiver</MenuItem>
                    <MenuItem value="Housekeeper">Housekeeper</MenuItem>
                  </Select>
                </FormControl>

                {/* Location Field */}
                <FormControl 
                  fullWidth 
                  margin="normal"
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#666',
                    },
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: primaryColor,
                        }
                      }
                    }
                  }}
                >
                  <InputLabel>Location</InputLabel>
                  <Select
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    label="Location"
                  >
                    <MenuItem value="Lagos">Lagos</MenuItem>
                    <MenuItem value="Abuja">Abuja</MenuItem>
                  </Select>
                </FormControl>

                {/* Submit Button */}
                <Box sx={{ mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={loading || success}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${primaryColor} 0%, #7a9c96 100%)`,
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      textTransform: 'none',
                      transition: 'all 0.3s',
                      '&:hover': {
                        background: accentColor,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 6px 20px rgba(221, 112, 10, 0.3)`,
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&.Mui-disabled': {
                        background: '#e0e0e0',
                        color: '#999',
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 2, color: 'inherit' }} />
                        Processing...
                      </>
                    ) : success ? (
                      <>
                        <CheckCircle sx={{ mr: 1 }} />
                        Registration Complete!
                      </>
                    ) : (
                      'Register Now'
                    )}
                  </Button>
                </Box>
              </form>

              {/* Footer Note */}
              <Typography 
                variant="caption" 
                color="text.secondary" 
                align="center"
                display="block"
                sx={{ mt: 3, lineHeight: 1.5 }}
              >
                By registering, you agree to our Terms of Service and Privacy Policy.
                You will receive login credentials via email.
              </Typography>
            </Paper>

            {/* Trust Badges */}
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                justifyContent: 'center',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              {['✓ Secure Registration', '✓ 24/7 Support', '✓ Verified Platform'].map((text, index) => (
                <Typography
                  key={index}
                  variant="caption"
                  sx={{
                    color: primaryColor,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  {text}
                </Typography>
              ))}
            </Box>
          </Box>
        </Fade>
      </Container>
    </Box>
  );
};

export default FacebookAdsForm;