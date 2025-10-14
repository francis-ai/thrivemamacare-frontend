import React from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
} from '@mui/material';
import {
  Dashboard,
  People,
  Person,
  Assignment,
  Reviews,
  // MonetizationOn,
  // Mail,
  // Notifications,
  Help,
  Settings,
  Logout,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: 'dashboard' },
  { text: 'Manage Helpers', icon: <People />, path: 'caregivers' },
  { text: 'Manage Users', icon: <Person />, path: 'users' },
  { text: 'Jobs', icon: <Assignment />, path: 'all-jobs' },
  { text: 'Reviews', icon: <Reviews />, path: 'reviews' },
  // { text: 'Earnings', icon: <MonetizationOn />, path: 'earnings' },
  // { text: 'Messages', icon: <Mail />, path: 'messages' },
  // { text: 'Notifications', icon: <Notifications />, path: 'notifications' },
  { text: 'Support Tickets', icon: <Help />, path: 'support' },
  { text: 'Vacancies', icon: <Help />, path: 'vacancy' },
  { text: 'Subscription Plans', icon: <Help />, path: 'subscription' },
  { text: 'Lagal & Info', icon: <Settings />, path: 'legal-info'},
  { text: 'Settings', icon: <Settings />, path: 'settings' },
  { text: 'Logout', icon: <Logout />, path: 'logout' }, 
];

const Sidebar = ({ mobileOpen, handleDrawerToggle, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const drawerContent = (
    <div>
      <Toolbar sx={{ fontWeight: 'bold', color: '#fff', fontSize: 20, pl: 2 }}>
        Admin Panel
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List>
        {menuItems.map(({ text, icon, path }) => (
          <ListItemButton
            key={text}
            selected={location.pathname === `/admin/${path}`}
            onClick={() => {
              if (path === 'logout') {
                localStorage.clear(); // Clear all session data
                navigate('/admin/login');
              } else {
                if (location.pathname !== `/admin/${path}`) {
                  navigate(`/admin/${path}`);
                }
              }

              if (isMobile) handleDrawerToggle();
            }}
            sx={{
              color: 'white',
              '&.Mui-selected': {
                backgroundColor: '#486c66',
                '&:hover': { backgroundColor: '#486c66' },
              },
            }}
          >
            <ListItemIcon sx={{ color: 'white' }}>{icon}</ListItemIcon>
            <ListItemText primary={text} />
          </ListItemButton>
        ))}
      </List>
    </div>
  );

  return (
    <>
      {isMobile ? (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#648E87',
              color: '#fff',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      ) : (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              backgroundColor: '#648E87',
              color: '#fff',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
    </>
  );
};

export default Sidebar;
