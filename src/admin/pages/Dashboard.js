import React from 'react';
import { Box, Grid, Card, Typography, IconButton } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import BadgeIcon from '@mui/icons-material/Badge';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';

const cardData = [
  {
    title: 'Users',
    icon: <PeopleIcon sx={{ fontSize: 60 }} />,
    bgColor: '#1E88E5',
    link: '/admin/users',
  },
  {
    title: 'Caregivers',
    icon: <BadgeIcon sx={{ fontSize: 60 }} />,
    bgColor: '#43A047',
    link: '/admin/caregivers',
  },
  {
    title: 'Requests',
    icon: <AssignmentIcon sx={{ fontSize: 60 }} />,
    bgColor: '#FB8C00',
    link: '/admin/requests',
  },
  {
    title: 'Support',
    icon: <SupportAgentIcon sx={{ fontSize: 60 }} />,
    bgColor: '#8E24AA',
    link: '/admin/support',
  },
  {
    title: 'Messages',
    icon: <MailOutlineIcon sx={{ fontSize: 60 }} />,
    bgColor: '#3949AB',
    link: '/admin/messages',
  },
  {
    title: 'Notifications',
    icon: <NotificationsIcon sx={{ fontSize: 60 }} />,
    bgColor: '#F4511E',
    link: '/admin/notifications',
  },
  {
    title: 'Earnings',
    icon: <AccountBalanceWalletIcon sx={{ fontSize: 60 }} />,
    bgColor: '#00897B',
    link: '/admin/earnings',
  },
];

const Dashboard = () => {
  const navigate = useNavigate();
  

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={3}>
        Admin Dashboard
      </Typography>
      

      <Grid container spacing={3}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              onClick={() => navigate(card.link)}
              sx={{
                height: 150,
                width: 255,
                backgroundColor: card.bgColor,
                color: '#fff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }}
            >
              <IconButton sx={{ color: '#fff', mb: 1 }}>
                {card.icon}
              </IconButton>
              <Typography variant="h6" fontWeight="bold">
                {card.title}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;