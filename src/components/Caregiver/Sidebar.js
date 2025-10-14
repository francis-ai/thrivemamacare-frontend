import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Work,
  Favorite,
  // Assignment,
  Star,
  AccountCircle,
  VerifiedUser,
  Notifications,
  // Payment,
  // CalendarMonth,
  SupportAgent,
  Logout,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/caregiver/dashboard' },
    { text: 'Available Jobs', icon: <Work />, path: '/caregiver/jobs' },
    { text: 'My Application', icon: <Favorite />, path: '/caregiver/my-applications' },
    { text: 'My Reviews', icon: <Star />, path: '/caregiver/my-reviews' },
    { text: 'My Profile', icon: <AccountCircle />, path: '/caregiver/profile' },
    { text: 'Documents & KYC', icon: <VerifiedUser />, path: '/caregiver/kyc' },
    { text: 'Review', icon: <Star />, path: '/caregiver/review' },
    { text: 'Support', icon: <SupportAgent />, path: '/caregiver/support' },
    // { text: 'My Engagements', icon: <Assignment />, path: '/caregiver/my-engagements' },
    { text: 'Notifications', icon: <Notifications />, path: '/caregiver/notifications' },
    // { text: 'Earnings', icon: <Payment />, path: '/caregiver/earnings' },
    // { text: 'Schedule', icon: <CalendarMonth />, path: '/caregiver/schedule' },
    // 
    { text: 'Logout', icon: <Logout />, path: '/logout' },
  ];

  const drawerContent = (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', height: '100%', width: '300px' }}>
      <List>
        {navItems.map((item) => (
          <ListItem button key={item.text} component={Link} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Mobile Hamburger Menu */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', top: 65, right: 0, zIndex: 1200, backgroundColor: '#648E87', width: "100%", margirBottom: '10px' }}>
        <IconButton onClick={handleDrawerToggle}>
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: 'none', md: 'block' },
          width: drawerWidth,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: drawerWidth,
            backgroundColor: '#f5f5f5',
            height: 'auto',
            overflow: 'auto',
          }}
        >
          {drawerContent}
        </Box>
      </Box>
    </>
  );
};

export default Sidebar;
