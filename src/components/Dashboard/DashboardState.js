import { useState, useEffect } from 'react';
import { Card, CardContent, Typography, CircularProgress } from '@mui/material';
import { People } from '@mui/icons-material';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import '../../assets/css/dashboard/DashboardState.css';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const DashboardStats = () => {
  const { user } = useAuthUser();
  const [totalRequests, setTotalRequests] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestCount = async () => {
      try {
        const userId = user?.id;
        if (!userId) return;

        const response = await axios.get(
          `${BASE_URL}/api/users/caregiver-requests-count/${userId}`
        );
        
        setTotalRequests(response.data.count || 0);
      } catch (err) {
        setError('Failed to load request count');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRequestCount();
  }, [user]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <CircularProgress size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '20px',
      marginTop: '20px',
      width: '100%',
    }}>
      {/* Total Requests Card */}
      <div style={{ flex: '1 1 300px' }}>
        <Card style={{ height: '100%' }}>
          <CardContent>
            <People className="primary" style={{ fontSize: 30 }} />
            <Typography variant="subtitle2" style={{ marginTop: 10 }}>
              Total Requests
            </Typography>
            <Typography variant="h5">
              {totalRequests}
            </Typography>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;