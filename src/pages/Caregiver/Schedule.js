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
import axios from 'axios';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import { useAuth } from '../../context/AuthContext'; 

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Schedule = () => {
  const { caregiver } = useAuth(); // from context
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/schedule/${caregiver.id}`);
        console.log('Schedule:', res.data.schedule); // ✅ Add this
        setAppointments(res.data.schedule);
      } catch (err) {
        console.error('Error fetching caregiver schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    if (caregiver?.id) {
      fetchSchedule();
    }
  }, [caregiver]);


  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          My Schedule
        </Typography>

        <Card sx={{ backgroundColor: '#648E87', color: 'white', mb: 3 }}>
          <CardContent>
            <Typography variant="h6">Upcoming Week</Typography>
            <Typography>
              You have {appointments.length} scheduled engagement
              {appointments.length !== 1 && 's'}.
            </Typography>
          </CardContent>
        </Card>

        {loading ? (
          <Box textAlign="center" py={5}>
            <CircularProgress />
          </Box>
        ) : appointments.length === 0 ? (
          <Typography>No scheduled appointments yet.</Typography>
        ) : (
          <Paper elevation={3}>
            <Typography variant="h6" sx={{ p: 2, borderBottom: '1px solid #ccc' }}>
              Scheduled Engagements
            </Typography>
            <List>
              {appointments.map((eng, index) => (
                <React.Fragment key={eng.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={`${eng.appointment_date} | ${eng.appointment_time}`}
                      secondary={
                        <>
                          <Typography variant="body2">
                            <strong>Service:</strong> {eng.request_title} ({eng.service_type})
                          </Typography>
                          <Typography variant="body2">
                            <strong>Client:</strong> {eng.user_name} | {eng.user_phone}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Status:</strong> {eng.status}
                          </Typography>
                          {eng.notes && (
                            <Typography variant="body2">
                              <strong>Notes:</strong> {eng.notes}
                            </Typography>
                          )}
                        </>
                      }
                    />
                  </ListItem>
                  {index < appointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </DashboardLayout>
  );
};

export default Schedule;
