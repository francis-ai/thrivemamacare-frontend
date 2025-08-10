import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../Navbar';
import Footer from '../Footer';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <>
      <Navbar />
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          marginTop: '60px', // only margin top
          marginLeft: 0,
          marginRight: 0,
          marginBottom: 0,
          padding: 0,
        }}
      >
        {/* Sidebar Column */}
        <Box sx={{ width: 260, backgroundColor: '#f5f5f5', minHeight: '100%' }}>
          <Sidebar />
        </Box>

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