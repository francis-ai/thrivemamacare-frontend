import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../Navbar';
import Footer from '../Footer';

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          marginLeft: 0,
          marginRight: 0,
          marginBottom: 0,
          padding: 0,
        }}
      >
        {/* Content Column */}
        <Box sx={{ 
            flexGrow: 1,
            margin: '30px auto',
            padding: '20px',
         }}>
          {children}
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default DashboardLayout;