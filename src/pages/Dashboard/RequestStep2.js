// src/pages/dashboard/RequestStep2.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  Box,
  Typography,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
} from '@mui/material';

const durations = [
  '3 hours per day',
  '6 hours per day',
  '2-3 days per week',
  'Weekends only',
  'Full-time (Mon–Fri)',
];

const RequestStep2 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const serviceType = new URLSearchParams(location.search).get('service');

  const [selectedDuration, setSelectedDuration] = useState('');

  const handleNext = () => {
    if (!selectedDuration) return;
    navigate(`/dashboard/request-step3?service=${serviceType}&duration=${encodeURIComponent(selectedDuration)}`);
  };

  return (
    <DashboardLayout>
      <Box maxWidth="600px" mx="auto">
        <Typography variant="h5" gutterBottom>
          Step 2: Select Duration
        </Typography>

        <FormControl component="fieldset" sx={{ mt: 2 }}>
          <FormLabel component="legend">How often do you need the caregiver?</FormLabel>
          <RadioGroup
            aria-label="duration"
            name="duration"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(e.target.value)}
          >
            {durations.map((duration, index) => (
              <FormControlLabel
                key={index}
                value={duration}
                control={<Radio />}
                label={duration}
              />
            ))}
          </RadioGroup>
        </FormControl>

        <Box sx={{ mt: 4, }}>
          <Button sx={{backgroundColor: '#648E87'}}
            variant="contained"
            onClick={handleNext}
            disabled={!selectedDuration}
          >
            Continue to Step 3
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RequestStep2;
