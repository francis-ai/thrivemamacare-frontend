import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const MyEngagement = () => {
  const { caregiver } = useAuthCaregiver();
  const [engagements, setEngagements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEngagements = async () => {
      if (!caregiver?.id) return;

      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/engagements/${caregiver.id}`);
        setEngagements(res.data.engagements || []);
      } catch (error) {
        console.error('Error fetching engagements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEngagements();
  }, [caregiver?.id]);

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Engagements
        </Typography>

        {loading ? (
          <Box mt={4} textAlign="center">
            <CircularProgress />
          </Box>
        ) : engagements.length === 0 ? (
          <Typography variant="body1" mt={2}>
            You currently have no active engagements.
          </Typography>
        ) : (
          <Grid container spacing={2} mt={1}>
            {engagements.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.interest_id}>
                <Card sx={{ backgroundColor: '#FAFAFA' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {item.service} for {item.user_gender === 'male' ? 'Mr.' : 'Mrs.'} {item.user_name}
                    </Typography>
                    <Typography><strong>Service:</strong> {item.service_type}</Typography>
                    <Typography><strong>Location:</strong> {item.address}</Typography>
                    <Typography><strong>Schedule:</strong> {item.schedule}</Typography>
                    <Typography><strong>Requested On:</strong> {new Date(item.created_at).toLocaleDateString()}</Typography>
                    <Box mt={2} display="flex" alignItems="center" justifyContent="space-between">
                      <Chip label="Ongoing" color="primary" size="small" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default MyEngagement;
