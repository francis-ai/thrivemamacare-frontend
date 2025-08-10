import React, { useEffect, useState} from 'react';
import '../assets/css/Dashboard.css';
import DashboardLayout from '../components/Dashboard/DashboardLayout';  
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { HelpOutline } from '@mui/icons-material';
import DashboardState from '../components/Dashboard/DashboardState';

const Dashboard = () => {
   const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('user'));
    setUser(stored);
  }, []);


  return (
    <DashboardLayout>
      <Box>
        <Typography variant="h5" gutterBottom>
         Welcome {user?.name || 'Guest'}!
        </Typography>
        {/* Request Caregiver Button */}
        <Button
          variant="contained"
          className="request-btn"
          sx={{ mt: 2, mb: 4, backgroundColor: '#648E87', }}
          href="/dashboard/request"
        >
          Request a Helper
        </Button>

        {/* Dashboard State */}
        <DashboardState />

        {/* Contact Suppport */}
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <HelpOutline className="primary" />
              <Typography variant="h6">Need Help?</Typography>
              <Typography variant="body2">
                Reach out to our support team anytime if you have questions or issues.
              </Typography>
              <Button className="support-btn" variant="outlined" sx={{ mt: 2, borderColor: '#648E87', color: '#648E87' }} href="/dashboard/support">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default Dashboard;
