import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Earnings = () => {
  const { caregiver } = useAuth();
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/earnings/${caregiver?.id}`);
        setSummary(res.data.summary);
        setHistory(res.data.history);
        setWalletBalance(res.data.available_balance); // available balance from backend
      } catch (error) {
        console.error("Failed to fetch earnings", error);
      } finally {
        setLoading(false);
      }
    };

    if (caregiver?.id) {
      fetchEarnings();
    }
  }, [caregiver]);

  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 4 }}>
          <CircularProgress />
        </Box>
      </DashboardLayout>
    );
  }

  const totalEarnings = history.reduce(
    (sum, earning) => sum + parseFloat(earning.net_amount || 0),
    0
  );

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Earnings
        </Typography>

        {/* Summary Card */}
        <Card sx={{ backgroundColor: '#648E87', color: 'white', mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Total Earnings (Net)</Typography>
            <Typography variant="h4">₦{totalEarnings.toLocaleString()}</Typography>
            <Typography sx={{ mt: 1 }}>Appointments: {summary?.total_appointments}</Typography>
            <Typography>Last Payment: {summary?.last_payment_date?.slice(0, 10) || 'N/A'}</Typography>
            <Typography sx={{ mt: 1 }}>Wallet Balance: ₦{walletBalance.toLocaleString()}</Typography>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Paper elevation={3}>
          <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
            Payment History
          </Typography>
          <List>
            {history.map((earning, index) => (
              <React.Fragment key={earning.id}>
                <ListItem>
                  <ListItemText
                    primary={`₦${parseFloat(earning.net_amount).toLocaleString()} (after 10% fee)`}
                    secondary={`Date: ${earning.created_at?.slice(0, 10)} • Fee: ₦${parseFloat(earning.platform_fee).toLocaleString()} • Ref: ${earning.payment_reference}`}
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default Earnings;
