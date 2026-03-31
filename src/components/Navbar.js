import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, Avatar, Menu, MenuItem,
  Typography, IconButton, Drawer, List, ListItem, ListItemIcon,
  ListItemText, Divider, useMediaQuery, useTheme, Chip, Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Logout as LogoutIcon,
  DashboardOutlined,
  WorkOutline,
  AssignmentTurnedInOutlined,
  ChecklistRtlOutlined,
  NotificationsNone,
  AccountCircleOutlined,
  SupportAgentOutlined,
  RateReviewOutlined,
  FavoriteBorderOutlined,
  StarBorderOutlined,
  GroupsOutlined,
  VerifiedUserOutlined,
  NotificationsNoneOutlined,

  PaymentOutlined,
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
    if (caregiver) setUser({ name: caregiver.name, role: 'caregiver', data: caregiver });
    else if (userData) setUser({ name: userData.name, role: 'user', data: userData });
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

  // User sidebar navigation items
  const userNavItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardOutlined />, 
      path: '/dashboard',
      badge: null
    },
    { 
      text: 'View All Helpers', 
      icon: <WorkOutline />, 
      path: '/dashboard/caregivers',
      badge: null
    },
    { 
      text: 'Create Request', 
      icon: <AssignmentTurnedInOutlined />, 
      path: '/dashboard/request',
      badge: null
    },
    { 
      text: 'My Requests', 
      icon: <FavoriteBorderOutlined />, 
      path: '/dashboard/my-requests',
      badge: null
    },
    { 
      text: 'View Matches', 
      icon: <ChecklistRtlOutlined />, 
      path: '/dashboard/view-matches',
      badge: null
    },
    { 
      text: 'My Reviews', 
      icon: <RateReviewOutlined />, 
      path: '/dashboard/review',
      badge: null
    },
    { 
      text: 'My Account', 
      icon: <AccountCircleOutlined />, 
      path: '/dashboard/account',
      badge: null
    },
    { 
      text: 'My Plan', 
      icon: <PaymentOutlined />, 
      path: '/dashboard/my-plan',
      badge: null
    },
    { 
      text: 'Notifications', 
      icon: <NotificationsNone />, 
      path: '/dashboard/notifications',
      badge: 3 // Example notification count
    },
    { 
      text: 'Support', 
      icon: <SupportAgentOutlined />, 
      path: '/dashboard/support',
      badge: null
    }
  ];

  // Caregiver sidebar navigation items
  const caregiverNavItems = [
    { 
      text: 'Dashboard', 
      icon: <DashboardOutlined />, 
      path: '/caregiver/dashboard',
      badge: null
    },
    { 
      text: 'View All Matches', 
      icon: <GroupsOutlined />, 
      path: '/caregiver/view-matches',
      badge: null
    },
    { 
      text: 'My Reviews', 
      icon: <StarBorderOutlined />, 
      path: '/caregiver/my-reviews',
      badge: null
    },
    { 
      text: 'My Profile', 
      icon: <AccountCircleOutlined />, 
      path: '/caregiver/profile',
      badge: null
    },
    { 
      text: 'Documents & KYC', 
      icon: <VerifiedUserOutlined />, 
      path: '/caregiver/kyc',
      badge: null
    },
    { 
      text: 'Notifications', 
      icon: <NotificationsNoneOutlined />, 
      path: '/caregiver/notifications',
      badge: 2 // Example notification count
    },
    { 
      text: 'Support', 
      icon: <SupportAgentOutlined />, 
      path: '/caregiver/support',
      badge: null
    }
  ];

  const currentNavItems = user?.role === 'caregiver' ? caregiverNavItems : userNavItems;

  const NavButton = ({ path, label, mobile = false }) => (
    <Button
      component={Link}
      to={path}
      onClick={() => setMobileOpen(false)}
      sx={{
        display: 'block',
        width: '100%',
        justifyContent: 'flex-start',
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
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: 70,
          zIndex: 1200
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
                        {user?.name?.charAt(0)?.toUpperCase() || ''}
                      </Avatar>
                    }
                    sx={{
                      textTransform: 'none',
                      color: 'text.primary',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(100, 142, 135, 0.08)'
                      }
                    }}
                  >
                    {user?.name || ''}
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{
                      sx: {
                        width: 320,
                        maxHeight: 'calc(100% - 80px)',
                        borderRadius: 2,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                        mt: 1,
                        overflow: 'hidden'
                      }
                    }}
                  >
                    {/* User Profile Header */}
                    <Box sx={{ 
                      p: 2, 
                      bgcolor: '#f8f9fa',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            width: 48, 
                            height: 48, 
                            bgcolor: '#648E87',
                            fontSize: '1.2rem'
                          }}
                        >
                          {user?.name?.charAt(0)?.toUpperCase() || ''}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {user.name}
                          </Typography>
                          <Chip 
                            label={user.role === 'caregiver' ? 'Caregiver Account' : 'User Account'} 
                            size="small"
                            sx={{ 
                              height: 20, 
                              fontSize: '0.7rem',
                              backgroundColor: user.role === 'caregiver' ? '#e3f2fd' : '#e8f5e9',
                              color: user.role === 'caregiver' ? '#1976d2' : '#2e7d32'
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>

                    {/* Navigation Items */}
                    <Box sx={{ 
                      maxHeight: 400, 
                      overflowY: 'auto',
                      '&::-webkit-scrollbar': {
                        width: '6px',
                      },
                      '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                      },
                      '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '3px',
                      },
                    }}>
                      <List sx={{ p: 1 }}>
                        {currentNavItems.map((item) => (
                          <MenuItem
                            key={item.text}
                            onClick={() => {
                              navigate(item.path);
                              handleCloseMenu();
                            }}
                            sx={{
                              borderRadius: 1.5,
                              mb: 0.5,
                              py: 1.2,
                              backgroundColor: location.pathname === item.path ? '#e8f0ee' : 'transparent',
                              '&:hover': {
                                backgroundColor: '#f5f5f5',
                              }
                            }}
                          >
                            <ListItemIcon sx={{ 
                              color: location.pathname === item.path ? '#648E87' : '#666',
                              minWidth: 40
                            }}>
                              {item.icon}
                            </ListItemIcon>
                            <ListItemText 
                              primary={item.text}
                              primaryTypographyProps={{
                                fontWeight: location.pathname === item.path ? 600 : 400,
                                fontSize: '0.9rem',
                                color: location.pathname === item.path ? '#648E87' : '#2c3e50'
                              }}
                            />
                            {item.badge && (
                              <Badge 
                                badgeContent={item.badge} 
                                color="error"
                                sx={{
                                  '& .MuiBadge-badge': {
                                    fontSize: '0.7rem',
                                    height: 18,
                                    minWidth: 18,
                                    borderRadius: 9
                                  }
                                }}
                              />
                            )}
                          </MenuItem>
                        ))}
                      </List>
                    </Box>

                    <Divider />

                    {/* Logout Button */}
                    <Box sx={{ p: 1.5 }}>
                      <MenuItem
                        onClick={handleLogout}
                        sx={{
                          borderRadius: 1.5,
                          color: '#ff4444',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 68, 68, 0.04)'
                          }
                        }}
                      >
                        <ListItemIcon sx={{ color: '#ff4444', minWidth: 40 }}>
                          <LogoutIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Logout"
                          primaryTypographyProps={{
                            fontWeight: 500,
                            fontSize: '0.9rem'
                          }}
                        />
                      </MenuItem>
                    </Box>
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
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            backgroundColor: 'background.paper'
          }
        }}
      >
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            p: 2, 
            borderBottom: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Typography variant="h6" fontWeight="700" color="#648E87">
              Menu
            </Typography>
            <IconButton onClick={() => setMobileOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* User Info */}
          {user && (
            <Box sx={{ 
              p: 2, 
              m: 2, 
              borderRadius: 2, 
              bgcolor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ width: 40, height: 40, bgcolor: '#648E87' }}>
                {user?.name?.charAt(0)?.toUpperCase() || ''}
              </Avatar>
              <Box>
                <Typography fontWeight="600">{user.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role === 'caregiver' ? 'Caregiver' : 'User'}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Navigation Items */}
          <List sx={{ flex: 1, px: 2 }}>
            {navItems.map((item) => (
              <ListItem
                button
                key={item.path}
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1.2,
                  backgroundColor: location.pathname === item.path ? '#e8f0ee' : 'transparent'
                }}
              >
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 600 : 400,
                    color: location.pathname === item.path ? '#648E87' : 'text.primary'
                  }}
                />
              </ListItem>
            ))}
            
            {user && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ px: 2, mb: 1, color: '#666' }}>
                  {user.role === 'caregiver' ? 'Caregiver Menu' : 'Account Menu'}
                </Typography>
                {currentNavItems.map((item) => (
                  <ListItem
                    button
                    key={item.text}
                    component={Link}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 2,
                      mb: 0.5,
                      py: 1.2,
                      backgroundColor: location.pathname === item.path ? '#e8f0ee' : 'transparent'
                    }}
                  >
                    <ListItemIcon sx={{ 
                      color: location.pathname === item.path ? '#648E87' : '#666',
                      minWidth: 40
                    }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={item.text}
                      primaryTypographyProps={{
                        fontWeight: location.pathname === item.path ? 600 : 400,
                        fontSize: '0.9rem'
                      }}
                    />
                    {item.badge && (
                      <Badge 
                        badgeContent={item.badge} 
                        color="error"
                        sx={{
                          '& .MuiBadge-badge': {
                            fontSize: '0.7rem',
                            height: 18,
                            minWidth: 18
                          }
                        }}
                      />
                    )}
                  </ListItem>
                ))}
              </>
            )}
          </List>

          {/* Logout Button */}
          <Box sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
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
                  borderColor: '#ff4444',
                  color: '#ff4444',
                  '&:hover': {
                    borderColor: '#cc0000',
                    backgroundColor: 'rgba(255, 68, 68, 0.04)'
                  }
                }}
              >
                Logout
              </Button>
            )}
          </Box>
        </Box>
      </Drawer>

      {/* Spacer for fixed AppBar */}
      <Toolbar />
    </>
  );
};

export default Navbar;