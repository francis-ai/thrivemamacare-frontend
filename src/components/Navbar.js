import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, IconButton, Drawer, List, ListItem, ListItemText,
  Divider, Avatar, Typography, Box, Button, useMediaQuery, useTheme, styled
} from '@mui/material';
import {
  Menu as MenuIcon, Close as CloseIcon, AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const AnimatedNavLink = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 500,
  position: 'relative',
  '&:hover': {
    '&:after': { width: '100%' },
    animation: 'float 0.5s ease'
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


const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [loggedInName, setLoggedInName] = useState(null);
  const [settings, setSettings] = useState({ site_name: '', logo: '' });
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
  };

  const toggleDrawer = (state) => () => setOpen(state);

  const NavDrawerItem = ({ to, label, onClick }) => (
    <ListItem
      button component={Link} to={to} onClick={onClick}
      sx={{
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
          '& .MuiListItemText-primary': {
            transform: 'translateX(5px)',
            color: theme.palette.primary.main
          }
        },
        '& .MuiListItemText-primary': { transition: 'all 0.3s ease' }
      }}
    >
      <ListItemText primary={label} />
    </ListItem>
  );

  return (
    <>
      <AppBar position="fixed" sx={{
        height: 70, backgroundColor: 'background.paper', color: 'text.primary',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', zIndex: theme.zIndex.drawer + 1
      }}>
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <Box component={Link} to="/" sx={{
            display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit'
          }}>
            <Avatar src={settings.logo} alt="Logo" sx={{ width: 40, height: 40, mr: 1.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: '1.1rem', md: '1.3rem' } }}>
              {settings.site_name}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Box sx={{ display: 'flex', mr: 3, gap: 1 }}>
                <AnimatedNavLink component={Link} sx={{color: '#648E87'}} to="/">Home</AnimatedNavLink>
                <AnimatedNavLink component={Link} sx={{color: '#648E87'}} to="/about">About Us</AnimatedNavLink>
                <AnimatedNavLink component={Link} sx={{color: '#648E87'}} to="/faqs">FAQs</AnimatedNavLink>
              </Box>
            )}

            {!isMobile && !loggedInName && (
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <AnimatedNavLink component={Link} to="/login" variant="outlined"
                  sx={{ color: '#dd700a', borderColor: '#dd700a', '&:hover': { backgroundColor: '#fdf2e8' } }}>
                  Login
                </AnimatedNavLink>
                <AnimatedNavLink component={Link} to="/register" variant="contained"
                  sx={{ backgroundColor: '#648E87', '&:hover': { backgroundColor: '#557a73' } }}>
                  Register
                </AnimatedNavLink>
              </Box>
            )}

            {(isMobile || loggedInName) && (
              <IconButton onClick={toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={toggleDrawer(false)}
        sx={{ '& .MuiDrawer-paper': { width: 280, backgroundColor: theme.palette.background.default } }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <IconButton onClick={toggleDrawer(false)}><CloseIcon /></IconButton>
          </Box>

          {loggedInName && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 3 }}>
                <Avatar sx={{ width: 56, height: 56, mr: 2, bgcolor: '#648E87' }}>
                  <AccountCircleIcon fontSize="large" />
                </Avatar>
                <Box>
                  <Typography fontWeight={600}>{loggedInName.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {loggedInName.role === 'caregiver' ? 'Caregiver' : 'User'}
                  </Typography>
                </Box>
              </Box>
              <Divider />
            </>
          )}

          <List sx={{ flexGrow: 1 }}>
            <NavDrawerItem to="/"  sx={{color: '#648E87'}} label="Home" onClick={toggleDrawer(false)} />
            <NavDrawerItem to="/about" sx={{color: '#648E87'}}  label="About Us" onClick={toggleDrawer(false)} />
            <NavDrawerItem to="/faqs" sx={{color: '#648E87'}}  label="FAQs" onClick={toggleDrawer(false)} />
            {loggedInName && (
              <NavDrawerItem
                to={loggedInName.role === 'caregiver' ? "/caregiver/dashboard" : "/dashboard"}
                label="Dashboard"
                onClick={toggleDrawer(false)}
              />
            )}
            {!loggedInName && (
              <>
                <NavDrawerItem to="/login"  sx={{color: '#648E87'}} label="Login" onClick={toggleDrawer(false)} />
                <NavDrawerItem to="/register"  sx={{color: '#648E87'}} label="Register" onClick={toggleDrawer(false)} />
              </>
            )}
          </List>

          {loggedInName && (
            <>
              <Divider />
              <ListItem button onClick={handleLogout} sx={{ color: 'error.main' }}>
                <ListItemText primary="Logout" />
              </ListItem>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;
