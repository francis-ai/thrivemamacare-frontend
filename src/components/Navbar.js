import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Drawer, List, ListItem,
  Divider, Avatar, Typography, Box, Button, useMediaQuery, useTheme, styled,
  Menu, MenuItem, Fade
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AnimatedNavLink = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  position: 'relative',
  color: '#648E87',
  '&:hover': {
    backgroundColor: 'transparent',
    '&:after': { width: '100%' },
  },
  '&:after': {
    content: '""',
    position: 'absolute',
    width: '0',
    height: '2px',
    bottom: 0,
    left: 0,
    backgroundColor: '#648E87',
    transition: 'width 0.3s ease'
  }
}));

const MobileNavLink = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  justifyContent: 'flex-start',
  padding: '12px 24px',
  width: '100%',
  color: '#648E87',
  '&:hover': {
    backgroundColor: 'rgba(100, 142, 135, 0.1)',
  },
}));

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [loggedInName, setLoggedInName] = useState(null);
  const [settings, setSettings] = useState({ site_name: '', logo: '' });
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const caregiver = JSON.parse(localStorage.getItem('caregiver'));
    const user = JSON.parse(localStorage.getItem('user'));
    if (caregiver) setLoggedInName({ name: caregiver.name, role: 'caregiver' });
    else if (user) setLoggedInName({ name: user.name, role: 'user' });
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/get-settings`);
        setSettings({
          site_name: res.data.site_name || 'ThriveMama',
          logo: res.data.logo ? `${BASE_URL}/uploads/website-settings/${res.data.logo}` : '/ThriveMama.png'
        });
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setLoggedInName(null);
    navigate('/login');
    setOpen(false);
    handleCloseUserMenu();
  };

  const toggleDrawer = (state) => () => setOpen(state);

  const handleOpenUserMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorEl(null);
  };

  const NavDrawerItem = ({ to, label, onClick }) => (
    <ListItem
      button
      component={to ? Link : Button}
      to={to}
      onClick={onClick}
      sx={{
        padding: 0,
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        }
      }}
    >
      <MobileNavLink>
        {label}
      </MobileNavLink>
    </ListItem>
  );

  return (
    <>
      <AppBar position="fixed" sx={{
        height: 70, 
        backgroundColor: 'background.paper', 
        color: 'text.primary',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
        zIndex: theme.zIndex.drawer + 1
      }}>
        <Toolbar sx={{ 
          justifyContent: 'space-between', 
          px: { xs: 2, md: 4 },
          height: '100%'
        }}>
          <Box component={Link} to="/" sx={{
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit'
          }}>
            <Avatar src={settings.logo} alt="Logo" sx={{ width: 40, height: 40, mr: 1.5 }} />
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              color: '#648E87'
            }}>
              {settings.site_name}
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', mr: 1, gap: 1 }}>
                <AnimatedNavLink component={Link} to="/">Home</AnimatedNavLink>
                <AnimatedNavLink component={Link} to="/about">About Us</AnimatedNavLink>
                <AnimatedNavLink component={Link} to="/faq">FAQs</AnimatedNavLink>
              </Box>

              {loggedInName ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Button
                    onClick={handleOpenUserMenu}
                    endIcon={<ExpandMoreIcon />}
                    sx={{
                      textTransform: 'none',
                      color: '#648E87',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#648E87', fontSize: '0.9rem' }}>
                      {loggedInName.name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                      {loggedInName.name}
                    </Box>
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseUserMenu}
                    TransitionComponent={Fade}
                    sx={{
                      '& .MuiPaper-root': {
                        borderRadius: 2,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        minWidth: 200,
                        mt: 1
                      }
                    }}
                  >
                    <MenuItem 
                      onClick={() => {
                        navigate(loggedInName.role === 'caregiver' ? "/caregiver/dashboard" : "/dashboard");
                        handleCloseUserMenu();
                      }}
                    >
                      Dashboard
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <AnimatedNavLink 
                    component={Link} 
                    to="/login" 
                    variant="outlined"
                    sx={{ 
                      color: '#dd700a', 
                      borderColor: '#dd700a', 
                      '&:hover': { 
                        backgroundColor: '#fdf2e8',
                        borderColor: '#dd700a'
                      } 
                    }}
                  >
                    Login
                  </AnimatedNavLink>
                  <AnimatedNavLink 
                    component={Link} 
                    to="/register" 
                    variant="contained"
                    sx={{ 
                      backgroundColor: '#648E87', 
                      color: "#FFF",
                      '&:hover': { 
                        backgroundColor: '#557a73' 
                      } 
                    }}
                  >
                    Register
                  </AnimatedNavLink>
                </Box>
              )}
            </Box>
          )}

          {/* Mobile Navigation Toggle */}
          {isMobile && (
            <IconButton 
              onClick={toggleDrawer(true)}
              sx={{ color: '#648E87' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{ 
          '& .MuiDrawer-paper': { 
            width: 280, 
            backgroundColor: theme.palette.background.default,
            boxSizing: 'border-box'
          } 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: '#648E87', fontWeight: 600 }}>
              Menu
            </Typography>
            <IconButton onClick={toggleDrawer(false)} sx={{ color: '#648E87' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {loggedInName && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 1, borderRadius: 2, bgcolor: 'rgba(100, 142, 135, 0.1)' }}>
                <Avatar sx={{ width: 40, height: 40, mr: 2, bgcolor: '#648E87', fontSize: '0.9rem' }}>
                  {loggedInName.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography fontWeight={600} sx={{ color: '#648E87' }}>{loggedInName.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {loggedInName.role === 'caregiver' ? 'Caregiver' : 'User'}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
            </>
          )}

          <List sx={{ flexGrow: 1 }}>
            <NavDrawerItem to="/" label="Home" onClick={toggleDrawer(false)} />
            <NavDrawerItem to="/about" label="About Us" onClick={toggleDrawer(false)} />
            <NavDrawerItem to="/faq" label="FAQs" onClick={toggleDrawer(false)} />
            
            {loggedInName && (
              <NavDrawerItem
                to={loggedInName.role === 'caregiver' ? "/caregiver/dashboard" : "/dashboard"}
                label="Dashboard"
                onClick={toggleDrawer(false)}
              />
            )}
          </List>

          <Box sx={{ mt: 'auto' }}>
            {!loggedInName ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  component={Link}
                  to="/login"
                  fullWidth
                  variant="outlined"
                  onClick={toggleDrawer(false)}
                  sx={{
                    color: '#dd700a',
                    borderColor: '#dd700a',
                    '&:hover': {
                      backgroundColor: '#fdf2e8',
                      borderColor: '#dd700a'
                    }
                  }}
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  fullWidth
                  variant="contained"
                  onClick={toggleDrawer(false)}
                  sx={{
                    backgroundColor: '#648E87',
                    '&:hover': {
                      backgroundColor: '#557a73'
                    }
                  }}
                >
                  Register
                </Button>
              </Box>
            ) : (
              <Button
                fullWidth
                variant="outlined"
                onClick={handleLogout}
                sx={{
                  color: 'error.main',
                  borderColor: 'error.main',
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    borderColor: 'error.main'
                  }
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;