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
  DashboardOutlined,
  WorkOutline,
  HandshakeOutlined,
  AssignmentTurnedInOutlined,
  FavoriteBorderOutlined,
  PeopleAltOutlined,
  StarBorderOutlined,
  AccountCircleOutlined,
  VerifiedUserOutlined,
  RateReviewOutlined,
  SupportAgentOutlined,
  NotificationsNoneOutlined,
  AccountBalanceWalletOutlined,
} from '@mui/icons-material';

import { Link } from 'react-router-dom';

const drawerWidth = 240;

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
  { text: 'Dashboard', icon: <DashboardOutlined />, path: '/caregiver/dashboard' },
  { text: 'Available Jobs', icon: <WorkOutline />, path: '/caregiver/jobs' },
  { text: 'Available Requests', icon: <HandshakeOutlined />, path: '/caregiver/available-requests' },
  { text: 'My Applications', icon: <AssignmentTurnedInOutlined />, path: '/caregiver/my-applications' },
  { text: 'My Interests', icon: <FavoriteBorderOutlined />, path: '/caregiver/my-interests' },
  { text: 'My Engagements', icon: <PeopleAltOutlined />, path: '/caregiver/my-engagements' },
  { text: 'My Reviews', icon: <StarBorderOutlined />, path: '/caregiver/my-reviews' },
  { text: 'My Profile', icon: <AccountCircleOutlined />, path: '/caregiver/profile' },
  { text: 'Documents & KYC', icon: <VerifiedUserOutlined />, path: '/caregiver/kyc' },
  { text: 'Earnings', icon: <AccountBalanceWalletOutlined />, path: '/caregiver/earnings' },
  { text: 'Review', icon: <RateReviewOutlined />, path: '/caregiver/review' },
  { text: 'Support', icon: <SupportAgentOutlined />, path: '/caregiver/support' },
  { text: 'Notifications', icon: <NotificationsNoneOutlined />, path: '/caregiver/notifications' },

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
