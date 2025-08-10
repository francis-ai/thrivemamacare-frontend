// src/pages/dashboard/RequestStep3.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';

const RequestStep3 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const service = queryParams.get('service');
  const duration = queryParams.get('duration');

  const [ageGroup, setAgeGroup] = useState('');

  // Conditional age group options
  const ageOptions =
    service === 'Nanny'
      ? ['0-6 months', '6-12 months', '1-2 years', '3-5 years']
      : service === 'Elder'
      ? ['60-70 years', '71-80 years', '81+ years']
      : [];

  const handleNext = () => {
    const searchParams = new URLSearchParams({
      service,
      duration,
    });

    if (ageGroup) {
      searchParams.append('ageGroup', ageGroup);
    }

    navigate(`/dashboard/request-step4?${searchParams.toString()}`);
  };

  return (
    <DashboardLayout>
      <Box maxWidth="600px" mx="auto">
        <Typography variant="h5" gutterBottom>
          Step 3: Select Age Group
        </Typography>

        {ageOptions.length > 0 ? (
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Age Group</InputLabel>
            <Select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              label="Age Group"
            >
              {ageOptions.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            Age group is not required for this service type.
          </Typography>
        )}

        <Box mt={4}>
          <Button
            sx={{backgroundColor: '#648E87'}}
            variant="contained"
            color="primary"
            onClick={handleNext}
            disabled={ageOptions.length > 0 && !ageGroup}
          >
            Continue
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RequestStep3;