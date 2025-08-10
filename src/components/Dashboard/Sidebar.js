import React, { useState } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  IconButton,
  // Toolbar,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  People,
  ListAlt,
  Chat,
  Notifications,
  AccountCircle,
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
    { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
    { text: 'Request a Helper', icon: <People />, path: '/dashboard/request' },
    { text: 'My Requests', icon: <ListAlt />, path: '/dashboard/my-requests' },
    { text: 'Interested Helper', icon: <ListAlt />, path: '/dashboard/interest-caregiver' },
    { text: 'Approved Helper', icon: <ListAlt />, path: '/dashboard/approved-caregiver' },
    { text: 'Review', icon: <Chat />, path: '/dashboard/review' },
    { text: 'My Account', icon: <AccountCircle />, path: '/dashboard/account' },
    { text: 'Support', icon: <SupportAgent />, path: '/dashboard/support' },
    // Not fixed
    { text: 'Notifications', icon: <Notifications />, path: '/dashboard/notifications' },
    // { text: 'Messages', icon: <Chat />, path: '/dashboard/messages' },
    //
    { text: 'Logout', icon: <Logout />, path: '/logout' },
  ];

  const drawerContent = (
    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', height: '100%', width: '300px', }}>
      <List>
        {navItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Hamburger menu only on mobile */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', top: 65, right: 0, zIndex: 1200, backgroundColor: '#648E87', width: "100%", margirBottom: '10px' }}>
          <IconButton onClick={handleDrawerToggle}>
            <MenuIcon />
          </IconButton>
        </Box>
      {/* </div> */}
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