import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem,
  Typography, IconButton, Drawer, List, useMediaQuery, useTheme
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const Navbar = () => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState({ site_name: 'ThriveMama', logo: '' });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const caregiver = JSON.parse(localStorage.getItem('caregiver'));
    const userData = JSON.parse(localStorage.getItem('user'));
    if (caregiver) setUser({ name: caregiver.name, role: 'caregiver' });
    else if (userData) setUser({ name: userData.name, role: 'user' });
  }, []);

  useEffect(() => {
    axios.get(`${BASE_URL}/api/admin/get-settings`)
      .then(res => setSettings({
        site_name: res.data.site_name || 'ThriveMama',
        logo: res.data.logo ? `${BASE_URL}/uploads/website-settings/${res.data.logo}` : ''
      }))
      .catch(console.error);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
    handleCloseMenu();
  };

  const handleOpenMenu = (event) => setAnchorEl(event.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/faq', label: 'FAQs' }
  ];

  const NavButton = ({ path, label, mobile = false }) => (
    <Button
      component={Link}
      to={path}
      onClick={() => setMobileOpen(false)}
      sx={{
        display: 'block', // 👈 ensures full width (stacked)
        width: '100%',
        justifyContent: 'flex-start', // align text to the left
        textAlign: 'left',
        textTransform: 'none',
        fontWeight: location.pathname === path ? 600 : 400,
        color: location.pathname === path ? '#648E87' : 'text.primary',
        px: mobile ? 3 : 2,
        py: mobile ? 1.5 : 1,
        borderRadius: mobile ? 1 : 2,
        '&:hover': {
          backgroundColor: mobile
            ? 'rgba(100, 142, 135, 0.08)'
            : 'transparent',
          color: '#648E87',
        },
      }}
    >
      {label}
    </Button>
  );


  return (
    <AppBar 
      position="fixed" 
      elevation={0}
      sx={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid',
        borderColor: 'divider',
        height: 70
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 6 } }}>
        {/* Logo */}
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none',
            gap: 2
          }}
        >
          {settings.logo ? (
            <Avatar 
              src={settings.logo} 
              alt="Logo" 
              sx={{ 
                width: 40, 
                height: 40,
                border: '2px solid',
                borderColor: '#648E87'
              }} 
            />
          ) : (
            <Box
              sx={{
                width: 40,
                height: 40,
                bgcolor: '#648E87',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.2rem'
              }}
            >
              TM
            </Box>
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #648E87 0%, #dd700a 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {settings.site_name}
          </Typography>
        </Box>

        {/* Desktop Navigation */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {navItems.map((item) => (
              <NavButton key={item.path} {...item} />
            ))}
          </Box>
        )}

        {/* Desktop Auth Section */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user ? (
              <>
                <Button
                  onClick={handleOpenMenu}
                  startIcon={
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#648E87', fontSize: '0.9rem' }}>
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500
                  }}
                >
                  {user.name}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleCloseMenu}
                  sx={{
                    '& .MuiPaper-root': {
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                      minWidth: 180,
                      mt: 1
                    }
                  }}
                >
                  <MenuItem 
                    onClick={() => {
                      navigate(user.role === 'caregiver' ? "/caregiver/dashboard" : "/dashboard");
                      handleCloseMenu();
                    }}
                    sx={{ gap: 2 }}
                  >
                    <DashboardIcon fontSize="small" />
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ gap: 2 }}>
                    <LogoutIcon fontSize="small" />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    textTransform: 'none',
                    color: 'text.primary',
                    fontWeight: 500,
                    '&:hover': {
                      color: '#648E87'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#648E87',
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    '&:hover': {
                      backgroundColor: '#557870',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 12px rgba(100, 142, 135, 0.3)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </Box>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
        )}
      </Toolbar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 270,
            backgroundColor: 'background.paper'
          }
        }}
      >
        <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h6" fontWeight="700" color="#648E87">
              Menu
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Info */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Avatar sx={{ width: 48, height: 48, bgcolor: '#648E87' }}>
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography fontWeight="600">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.role === 'caregiver' ? 'Caregiver' : 'User'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Navigation */}
          <List sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {navItems.map((item) => (
              <NavButton key={item.path} {...item} mobile />
            ))}
            {user && (
              <Button
                component={Link}
                to={user.role === 'caregiver' ? "/caregiver/dashboard" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                startIcon={<DashboardIcon />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  color: 'text.primary',
                  width: '100%',
                  justifyContent: 'flex-start',
                  px: 3,
                  py: 2,
                  borderRadius: 0,
                  borderBottom: '1px solid',
                  borderColor: 'divider'
                }}
              >
                Dashboard
              </Button>
            )}
          </List>

          {/* Auth Buttons */}
          <Box sx={{ mt: 'auto' }}>
            {!user ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                  variant="outlined"
                  sx={{
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: '#648E87',
                    color: '#648E87'
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  fullWidth
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    py: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#648E87',
                    '&:hover': {
                      backgroundColor: '#557870'
                    }
                  }}
                >
                  Get Started
                </Button>
              </Box>
            ) : (
              <Button
                onClick={handleLogout}
                fullWidth
                variant="outlined"
                startIcon={<LogoutIcon />}
                sx={{
                  textTransform: 'none',
                  py: 1.5,
                  borderRadius: 2,
                  borderColor: 'error.main',
                  color: 'error.main'
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </AppBar>
  );
};

export default Navbar;