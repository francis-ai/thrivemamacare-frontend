import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Chip,
  Paper,
  IconButton,
  Alert
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import StarBorderOutlinedIcon from '@mui/icons-material/StarBorderOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Dashboard links with proper icons and colors
const dashboardItems = [
  { 
    text: 'My Reviews', 
    icon: <StarBorderOutlinedIcon />, 
    path: '/caregiver/my-reviews',
    color: '#FFB347',
    bgColor: '#FFF4E5',
    description: 'View feedback from clients'
  },
  { 
    text: 'My Profile', 
    icon: <AccountCircleOutlinedIcon />, 
    path: '/caregiver/profile',
    color: '#648E87',
    bgColor: '#EDF3F2',
    description: 'Update your information'
  },
  { 
    text: 'Support', 
    icon: <SupportAgentOutlinedIcon />, 
    path: '/caregiver/support',
    color: '#4A90E2',
    bgColor: '#E8F0FE',
    description: 'Get help when needed'
  },
  { 
    text: 'Notifications', 
    icon: <NotificationsNoneOutlinedIcon />, 
    path: '/caregiver/notifications',
    color: '#E2704A',
    bgColor: '#FEE9E3',
    description: 'Stay updated'
  },
];

const CaregiverDashboard = () => {
  const [caregiver, setCaregiver] = useState(null);
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('caregiver'));
    setCaregiver(stored);

    if (stored?.id) {
      fetchKycStatus(stored.id);

      if (!stored.has_seen_safety_popup) setOpen(true);
    }
  }, []);

  const fetchKycStatus = async (caregiverId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_URL}/api/caregivers/kyc-status/${caregiverId}`);
      setKycStatus(response.data.status);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch KYC status');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = async () => {
    setOpen(false);
    try {
      if (caregiver) {
        await axios.patch(`${BASE_URL}/api/auth/safety-popup/${caregiver.id}`, { type: 'caregiver' });
        const updated = { ...caregiver, has_seen_safety_popup: 1 };
        localStorage.setItem('caregiver', JSON.stringify(updated));
        setCaregiver(updated);
      }
    } catch (err) {
      console.error('Failed to update popup status:', err);
    }
  };

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header Section with Welcome and Stats */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #648E87 0%, #4F726C 100%)',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decorative Elements */}
          <Box
            sx={{
              position: 'absolute',
              top: -20,
              right: -20,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: -40,
              width: 200,
              height: 200,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                  {getGreeting()}, {caregiver?.name?.split(' ')[0] || 'Caregiver'}!
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Welcome to your caregiver dashboard
                </Typography>
              </Box>

              {/* KYC Status Badge */}
              {!loading && (
                <Chip
                  icon={kycStatus === 'verified' ? <VerifiedUserIcon /> : <SecurityIcon />}
                  label={kycStatus === 'verified' ? 'KYC Verified' : 'KYC Pending'}
                  sx={{
                    bgcolor: kycStatus === 'verified' ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.15)',
                    color: 'white',
                    fontWeight: 600,
                    px: 2,
                    py: 1,
                    height: 'auto',
                    '& .MuiChip-icon': {
                      color: kycStatus === 'verified' ? '#4CAF50' : '#FFB347',
                    },
                    backdropFilter: 'blur(4px)',
                  }}
                />
              )}
            </Box>
          </Box>
        </Paper>

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: 2 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Dashboard Title */}
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DashboardIcon sx={{ color: '#648E87' }} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#2C3E50' }}>
            Quick Actions
          </Typography>
        </Box>

        {/* Dashboard Cards - Redesigned */}
        <Grid container spacing={3}>
          {dashboardItems.map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    transition: 'all 0.3s ease',
                    border: '1px solid',
                    borderColor: 'rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 20px 30px rgba(0,0,0,0.1)',
                      borderColor: item.color,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        borderRadius: 2,
                        bgcolor: item.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 2,
                        transition: 'all 0.3s ease',
                        border: '2px solid transparent',
                        '&:hover': {
                          borderColor: item.color,
                        },
                      }}
                    >
                      <Box sx={{ color: item.color, fontSize: '2rem' }}>
                        {item.icon}
                      </Box>
                    </Box>

                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        color: '#2C3E50',
                        fontSize: { xs: '1.1rem', md: '1.2rem' }
                      }}
                    >
                      {item.text}
                    </Typography>

                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#64748B',
                        mb: 2,
                        fontSize: '0.875rem',
                        lineHeight: 1.5
                      }}
                    >
                      {item.description}
                    </Typography>

                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 0.5,
                        color: item.color,
                        fontSize: '0.875rem',
                        fontWeight: 500
                      }}
                    >
                      <span>Access</span>
                      <span>→</span>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>

        {/* Safety Popup - Redesigned */}
        <Dialog 
          open={open} 
          onClose={handleClosePopup} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              overflow: 'hidden',
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: '#648E87', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2,
            px: 3,
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Your Safety is Non-Negotiable
              </Typography>
            </Box>
            <IconButton onClick={handleClosePopup} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          
          <DialogContent sx={{ p: 3 }}>
            <Box sx={{ 
              maxHeight: '400px', 
              overflowY: 'auto',
              pr: 1,
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
                borderRadius: '10px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '10px',
              },
            }}>
              <Typography variant="body2" sx={{ color: '#2C3E50', lineHeight: 1.8 }}>
                • Always meet new clients in a public, well-lit place. Never at their home first. <br /><br />
                • Don't go alone — take a trusted person and tell someone where you are going. <br /><br />
                • Never share ID, photos, or personal details before verification. <br /><br />
                • Don't send money or do unpaid trial work. ThriveMama Care will never ask you to pay. <br /><br />
                • Refuse jobs or conditions that feel unsafe, disrespectful, or abusive. <br /><br />
                <strong style={{ color: '#648E87' }}>Emergency Contacts:</strong><br />
                📧 omugwosolutions@gmail.com<br />
                📞 0707 111 1070<br />
                📞 112 – Toll-free national emergency<br />
                📞 01-4931260 – Nigerian Police Force<br />
                📞 767 – Lagos State Emergency<br />
                📞 IGP SMS line: 080-5966666
              </Typography>
            </Box>
            
            <Button
              onClick={handleClosePopup}
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                bgcolor: '#648E87',
                color: 'white',
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#4F726C',
                },
              }}
            >
              I Understand & Agree
            </Button>
          </DialogContent>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
};

export default CaregiverDashboard;