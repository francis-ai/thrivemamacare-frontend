// src/pages/dashboard/Request.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import { ChildCare, Elderly, CleaningServices, Accessibility } from '@mui/icons-material';

const services = [
  { title: 'Nanny', icon: <ChildCare fontSize="large" />, value: 'Nanny' },
  { title: 'Elderly Care', icon: <Elderly fontSize="large" />, value: 'Elder' },
  { title: 'House Help', icon: <CleaningServices fontSize="large" />, value: 'Househelp' },
  { title: 'Special Needs', icon: <Accessibility fontSize="large" />, value: 'Special' },
];

const Request = () => {
  const navigate = useNavigate();

  const handleSelectService = (serviceType) => {
    // store in localStorage or context later
    navigate(`/dashboard/request-step2?service=${serviceType}`);
  };

  return (
    <DashboardLayout>
      <Box>
       <Typography variant="h5" gutterBottom color="#648E87">
        Select an Helper Service
      </Typography>
        <Grid container spacing={3}>
          {services.map((service) => (
            <Grid item xs={12} sm={6} md={3} key={service.value}>
              <Card sx={{ border: '1px solid #648E87', borderRadius: 2, width: '250px', }}>
                <CardActionArea onClick={() => handleSelectService(service.value)}>
                  <CardContent sx={{ textAlign: 'center', color: '#648E87' }}>
                    {service.icon}
                    <Typography variant="h6">{service.title}</Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </DashboardLayout>
  );
};

export default Request;
