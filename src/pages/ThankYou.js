import { useEffect } from 'react';
import { Box, Typography, Container, Alert, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ThankYou = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.fbq) {
      (function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod
            ? n.callMethod.apply(n, arguments)
            : n.queue.push(arguments);
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = true;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = true;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      })(
        window,
        document,
        'script',
        'https://connect.facebook.net/en_US/fbevents.js'
      );

      window.fbq('init', '25601828019505286');
    }

    window.fbq('track', 'PageView');
    window.fbq('track', 'CompleteRegistration');
  }, []);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: '#648E87', mb: 2 }} />

        <Typography variant="body1" color="text.secondary">
          Your application has been received successfully.
        </Typography>

        <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
          <strong>NB:</strong> Your default login password is{' '}
          <strong>Thrievemama123</strong>. Please change your password immediately after logging in.
        </Alert>

        {/* Login Button */}
        <Button
          variant="contained"
          size="large"
          sx={{
            mt: 4,
            px: 4,
            borderRadius: 3,
            backgroundColor: '#648E87',
            '&:hover': {
              backgroundColor: '#557c76',
            },
          }}
          onClick={() => navigate('/login')}
        >
          Go to Login
        </Button>
      </Container>
    </Box>
  );
};

export default ThankYou;
