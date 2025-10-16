import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  Typography,
  useTheme,
  CircularProgress,
  Alert,
  Snackbar
} from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axios from 'axios';
import { useAuthUser } from '../context/AuthContextUser';
import { useNavigate } from 'react-router-dom';
import '../assets/css/Subscription.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const PAYSTACK = process.env.PAYSTACK_PUBLIC_KEY || "pk_live_c5aeddafb04016980cb65613a8647f5ead7e8d4d";

export default function Subscription() {
  const theme = useTheme();
  const { user } = useAuthUser();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [userPlan, setUserPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentInitializing, setPaymentInitializing] = useState(false);
  const [error, setError] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchPlansAndUserPlan = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/general/subscription-plans`);
        if (!response.data || !Array.isArray(response.data)) {
          throw new Error('Invalid plans data received');
        }
        setPlans(response.data);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }

      try {
        if (!user?.id) return;
        const res = await axios.get(`${BASE_URL}/api/subscriptions/user-plan/${user.id}`);
        setUserPlan(res.data);
      } catch (err) {
        console.error("Failed to fetch user plan:", err);
      }
    };

    fetchPlansAndUserPlan();
  }, [user]);

  const handleSubscribe = (plan) => {
    if (!user) {
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }
    setPaymentInitializing(true);
    initializePayment(plan);
  };

  const initializePayment = (plan) => {
    const handler = window.PaystackPop.setup({
      key: PAYSTACK,
      email: user.email,
      amount: Number(plan.price) * 100,
      currency: 'NGN',
      ref: '' + Math.floor(Math.random() * 1000000000 + 1),
      metadata: {
        userId: user.id,
        plan: plan.plan_name
      },
      callback: function (response) {
        fetch(`${BASE_URL}/api/subscriptions/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: response.reference }),
        })
          .then((res) => res.json())
          .then(async (data) => {
            setPaymentInitializing(false);
            setSnackbar({
              open: true,
              message: data.message || 'Payment verified successfully.',
              severity: 'success',
            });

            // Refresh user plan
            try {
              const res = await axios.get(`${BASE_URL}/api/subscriptions/user-plan/${user.id}`);
              setUserPlan(res.data);
            } catch (err) {
              console.error("Error refreshing user plan:", err);
            }

            // Redirect to dashboard after 4 seconds
            setTimeout(() => navigate('/dashboard'), 4000);
          })
          .catch((err) => {
            console.error('Verification failed:', err);
            setPaymentInitializing(false);
            setSnackbar({
              open: true,
              message: 'Payment was successful but failed to verify with server.',
              severity: 'error',
            });
          });
      },
      onClose: function () {
        setPaymentInitializing(false);
        setSnackbar({
          open: true,
          message: 'Transaction was not completed.',
          severity: 'warning',
        });
      },
    });

    handler.openIframe();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (plans.length === 0 && !loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">No subscription plans available at the moment</Alert>
      </Container>
    );
  }

  return (
    <div className="Subscription-container">
      <div className="hero-section">
        <div className="animated-blob-1"></div>
        <div className="animated-blob-2"></div>
        <h1 className="hero-title">Choose Your Plan</h1>
        <Typography variant="h6" sx={{ color: 'white' }}>
          Unlock trusted caregivers and optional verifications.
        </Typography>
      </div>

      <Container sx={{ py: 6, mt: 4 }}>
        <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
          {plans.map((plan) => {
            const isSubscribed = userPlan?.currentPlan === plan.plan_name;
            return (
              <Grid item key={plan.id} xs={12} sm={6} md={4}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    border: plan.is_featured
                      ? `2px solid ${theme.palette.success.main}`
                      : "none",
                    boxShadow: plan.is_featured ? theme.shadows[6] : theme.shadows[2],
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    {plan.is_featured && (
                      <Chip
                        label="BEST VALUE"
                        color="success"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                    )}
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {plan.plan_name || 'Unnamed Plan'}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" gutterBottom>
                      ₦{plan.price ? plan.price.toLocaleString() : '0'}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      {plan.duration_days ? `${plan.duration_days} days` : 'No expiry'}
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <List>
                      {(plan.features || []).map((feature, index) => (
                        <ListItem key={index} disableGutters>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <CheckCircleIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <Typography variant="body2">{feature}</Typography>
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>

                 {plan.plan_name?.toLowerCase() !== 'free plan' && (
                  <Box sx={{ p: 2 }}>
                    <Button
                      fullWidth
                      variant={plan.is_featured ? "contained" : "outlined"}
                      color={plan.is_featured ? "success" : "primary"}
                      size="large"
                      onClick={() => handleSubscribe(plan)}
                      disabled={paymentInitializing || isSubscribed}
                    >
                      {isSubscribed
                        ? `Subscribed - Expires in ${userPlan?.daysRemaining || 0} days`
                        : paymentInitializing
                          ? <CircularProgress size={24} />
                          : plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                    </Button>
                  </Box>
                )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </div>
  );
}
