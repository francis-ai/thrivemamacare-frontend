import React, { useEffect, useState } from 'react';
import '../assets/css/Dashboard.css';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import { Box, Typography, Button, Card, CardContent, Dialog, DialogTitle, DialogContent, Chip } from '@mui/material';
import { HelpOutline, Star, Verified } from '@mui/icons-material';
import FetchAllCaregiver from '../components/Dashboard/FetchCaregivers';
import axios from 'axios';
import { useAuthUser } from '../context/AuthContextUser';
import useUserPlan from '../hooks/useUserPlan';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Dashboard = () => {
  const { user, setUser } = useAuthUser();
  const { isPremium } = useUserPlan();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user && !user.has_seen_safety_popup) {
      setOpen(true);
    }
  }, [user]);

  const handleClose = async () => {
    setOpen(false);

    try {
      if (user) {
        await axios.patch(`${BASE_URL}/api/auth/safety-popup/${user.id}`, {
          type: user.type,
        });

        // Update auth context and local storage so popup doesn’t keep showing
        const updated = { ...user, has_seen_safety_popup: 1 };
        try { localStorage.setItem('user', JSON.stringify(updated)); } catch (e) {}
        if (setUser) setUser(updated);
      }
    } catch (err) {
      console.error('Failed to update popup status:', err);
    }
  };

  const isPremiumPlan = !!isPremium;

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Typography variant="h5" gutterBottom>
          Welcome {user?.name || 'Guest'}!{' '}
          {isPremiumPlan ? (
            <Chip
              icon={<Star style={{ color: '#FFD700' }} />}
              label="Premium User"
              size="small"
              color="success"
              sx={{ ml: 1 }}
            />
          ) : (
            <Chip
              icon={<Verified />}
              label="Standard User"
              size="small"
              color="default"
              sx={{ ml: 1 }}
            />
          )}
        </Typography>

        {/* Dashboard State */}
        {/* <DashboardState /> */}
        <Box>
          <FetchAllCaregiver />
        </Box>

         {/* Contact Support */}
        <Box sx={{ mt: 6, width: '91%' }}>
          <Card sx={{ width: '100%', overflow: 'hidden' }}>
            <CardContent>
              <HelpOutline className="primary" />
              <Typography variant="h6">Need Help?</Typography>
              <Typography variant="body2">
                Reach out to our support team anytime if you have questions or issues.
              </Typography>
              <Button
                className="support-btn"
                variant="outlined"
                sx={{ mt: 2, borderColor: '#648E87', color: '#648E87' }}
                href="/dashboard/support"
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </Box>
        
      </Box>

      {/* Safety Popup */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>🔒 Safety First — Protect Yourself and Others</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            • While we conduct training and background checks, not everyone on this platform has been trained or verified. <br />
            • Only caregivers/helpers with the ThriveMama Care ticker badge ✅ have completed training. <br />
            • Verification is done after you choose a caregiver, and we strongly advise you to purchase the verification package on this site for your safety. <br />
            • Meet first in a public place before inviting a caregiver to your home, school, or business. <br />
            • Never request personal documents, photos, or unpaid trial work from caregivers. <br />
            • Be clear and truthful about job duties, location, and pay — no surprises. <br />
            • Treat every caregiver with respect and dignity. Abuse, harassment, or unsafe conditions are not tolerated. <br />
            • Report any suspicious behavior immediately: 📧 omugwosolutions@gmail.com | 📞 0707 111 1070
          </Typography>
          <Button
            onClick={handleClose}
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

export default Dashboard;


