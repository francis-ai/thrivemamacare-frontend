import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';

const lagosLocations = [
  'Ikeja',
  'Lekki',
  'Victoria Island',
  'Yaba',
  'Surulere',
  'Ajah',
  'Ikorodu',
  'Maryland',
  'Agege',
  'Ojota',
  'Other (Type your address)',
];

const RequestStep4 = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const service = queryParams.get('service');
  const duration = queryParams.get('duration');
  const ageGroup = queryParams.get('ageGroup') || '';

  const [selectedAddress, setSelectedAddress] = useState('');
  const [customAddress, setCustomAddress] = useState('');
  const [notes, setNotes] = useState('');

  const handleNext = () => {
    const finalAddress =
      selectedAddress === 'Other (Type your address)' ? customAddress : selectedAddress;

    const nextUrl = `/dashboard/request-step5?service=${service}&duration=${encodeURIComponent(
      duration
    )}${
      ageGroup ? `&ageGroup=${encodeURIComponent(ageGroup)}` : ''
    }&address=${encodeURIComponent(finalAddress)}&notes=${encodeURIComponent(notes)}`;

    navigate(nextUrl);
  };

  const isOtherSelected = selectedAddress === 'Other (Type your address)';
  const isAddressValid =
    (selectedAddress && selectedAddress !== 'Other (Type your address)') ||
    (isOtherSelected && customAddress.trim() !== '');

  return (
    <DashboardLayout>
      <Box maxWidth="600px" mx="auto">
        <Typography variant="h5" gutterBottom>
          Step 4: Location & Additional Info
        </Typography>

        <FormControl fullWidth margin="normal">
          <InputLabel>Select your area in Lagos</InputLabel>
          <Select
            value={selectedAddress}
            onChange={(e) => setSelectedAddress(e.target.value)}
            label="Select your area in Lagos"
            required
          >
            {lagosLocations.map((location) => (
              <MenuItem key={location} value={location}>
                {location}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {isOtherSelected && (
          <TextField
            label="Type your address"
            fullWidth
            margin="normal"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            required
          />
        )}

        <TextField
          label="Additional Notes (Optional)"
          fullWidth
          multiline
          rows={4}
          margin="normal"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <Box sx={{ mt: 4 }}>
          <Button
            sx={{ backgroundColor: '#648E87' }}
            variant="contained"
            onClick={handleNext}
            disabled={!isAddressValid}
          >
            Continue to Step 5
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
};

export default RequestStep4;
