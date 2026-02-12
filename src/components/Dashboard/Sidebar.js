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
  DashboardOutlined,
  WorkOutline,
  // PeopleAltOutlined,
  NotificationsNone,
  AccountCircleOutlined,
  SupportAgentOutlined,
  RateReviewOutlined,
  // CheckCircleOutline,
  FavoriteBorderOutlined,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const drawerWidth = 250;

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: 'Dashboard', icon: <DashboardOutlined />, path: '/dashboard' },
    { text: 'View All Helper', icon: <WorkOutline />, path: '/dashboard/caregivers' },
    // { text: 'Post Job', icon: <WorkOutline />, path: '/dashboard/create-job' },
    // { text: 'Request Helper', icon: <PeopleAltOutlined />, path: '/dashboard/request' },
    // { text: 'My Jobs', icon: <CheckCircleOutline />, path: '/dashboard/my-jobs' },
    // { text: 'My Requests', icon: <FavoriteBorderOutlined />, path: '/dashboard/my-requests' },
    // { text: 'Applications', icon: <WorkOutline />, path: '/dashboard/application' },
    // { text: 'Interested Helper', icon: <PeopleAltOutlined />, path: '/dashboard/interested-caregiver' },
    // { text: 'Approved Helper', icon: <CheckCircleOutline />, path: '/dashboard/approved-caregiver' },
    { text: 'Reviews', icon: <RateReviewOutlined />, path: '/dashboard/review' },
    { text: 'My Account', icon: <AccountCircleOutlined />, path: '/dashboard/account' },
    { text: 'My Plan', icon: <FavoriteBorderOutlined />, path: '/dashboard/my-plan' },
    { text: 'Support', icon: <SupportAgentOutlined />, path: '/dashboard/support' },
    { text: 'Notifications', icon: <NotificationsNone />, path: '/dashboard/notifications' },
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