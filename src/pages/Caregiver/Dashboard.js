import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, Dialog, DialogTitle, DialogContent, Button, Tooltip } from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import { AssignmentTurnedIn } from '@mui/icons-material';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const dashboardItems = [
  {
    title: 'Available Jobs',
    icon: <AssignmentTurnedIn fontSize="large" color="primary" />,
    bgColor: '#E3F2FD',
    path: '/caregiver/jobs',
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

      // 👀 Show popup only if not seen yet
      if (!stored.has_seen_safety_popup) {
        setOpen(true);
      }
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
        await axios.patch(`${BASE_URL}/api/auth/safety-popup/${caregiver.id}`, {
          type: 'caregiver',
        });

        // ✅ Update local storage so popup won’t keep showing
        const updated = { ...caregiver, has_seen_safety_popup: 1 };
        localStorage.setItem('caregiver', JSON.stringify(updated));
        setCaregiver(updated);
      }
    } catch (err) {
      console.error('Failed to update popup status:', err);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography variant="h5" gutterBottom>
            Welcome Back, {caregiver?.name || 'Guest'}
          </Typography>

          {loading ? (
            <Typography variant="caption">Checking verification...</Typography>
          ) : kycStatus === 'verified' ? (
            <Tooltip title="KYC Verified" arrow>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 1 }}>
                <VerifiedUserIcon color="success" fontSize="small" />
                <Typography variant="caption" color="text.secondary">
                  KYC Verified
                </Typography>
              </Box>
            </Tooltip>
          ) : null}
        </Box>
        {error && <p>Error</p>}

        <Grid container spacing={2} mt={1}>
          {dashboardItems.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Link to={item.path} style={{ textDecoration: 'none' }}>
                <Card
                  sx={{
                    backgroundColor: item.bgColor,
                    width: '300px',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={2}>
                      {item.icon}
                      <Box>
                        <Typography variant="h6" color="textPrimary">
                          {item.title}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Safety Popup */}
      <Dialog open={open} onClose={handleClosePopup} maxWidth="sm" fullWidth>
        <DialogTitle>🔒 Your Safety is Non-Negotiable</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            • Always meet new clients in a public, well-lit place. Never at their home first. <br />
            • Don’t go alone — take a trusted person and tell someone where you are going. <br />
            • Never share ID, photos, or personal details before verification. <br />
            • Don’t send money or do unpaid trial work. ThriveMama Care will never ask you to pay. <br />
            • Refuse jobs or conditions that feel unsafe, disrespectful, or abusive. <br />
            • Report suspicious behaviour immediately: 📧 omugwosolutions@gmail.com | 📞 0707 111 1070 <br />
            • 📞 112 – Toll-free national emergency number (police, fire, ambulance). <br />
            • 📞 01-4931260 – Nigerian Police Force emergency line. <br />
            • 📞 767 – Lagos State Emergency Response. <br />
            • 📞 IGP SMS line: 080-5966666
          </Typography>
          <Button
            onClick={handleClosePopup}
            variant="contained"
            sx={{ mt: 2, backgroundColor: '#648E87' }}
            fullWidth
          >
            I Understand
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default CaregiverDashboard;
