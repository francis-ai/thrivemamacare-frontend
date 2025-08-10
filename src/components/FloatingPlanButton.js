import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip, keyframes, styled } from "@mui/material";
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import axios from 'axios';
import { useAuthUser } from '../context/AuthContextUser';

const BASE_URL = process.env.REACT_APP_BASE_URL;

// Floating and pulsing animation
const float = keyframes`
  0% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-10px) rotate(2deg); }
  100% { transform: translateY(0px) rotate(0deg); }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
  100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
`;

const StyledButton = styled(Button)(({ plancolor }) => ({
  position: 'fixed',
  bottom: 32,
  right: 32,
  padding: '14px 24px',
  borderRadius: '50px',
  fontWeight: 'bold',
  textTransform: 'none',
  fontSize: '1rem',
  letterSpacing: '0.5px',
  transition: 'all 0.3s ease',
  animation: `${float} 4s ease-in-out infinite`,
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
  background: plancolor === 'primary' 
    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(124, 58, 237, 0.9) 100%)'
    : plancolor === 'warning'
    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)'
    : 'linear-gradient(135deg, rgba(156, 163, 175, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%)',
  color: 'white',
  boxShadow: `0 6px 20px ${plancolor === 'primary' 
    ? 'rgba(99, 102, 241, 0.3)'
    : plancolor === 'warning'
    ? 'rgba(245, 158, 11, 0.3)'
    : 'rgba(156, 163, 175, 0.3)'}`,
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 8px 25px ${plancolor === 'primary' 
      ? 'rgba(99, 102, 241, 0.4)'
      : plancolor === 'warning'
      ? 'rgba(245, 158, 11, 0.4)'
      : 'rgba(156, 163, 175, 0.4)'}`,
  },
  '& .MuiSvgIcon-root': {
    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
    transition: 'transform 0.3s ease',
  },
  '&:hover .MuiSvgIcon-root': {
    transform: 'scale(1.1) rotate(10deg)',
  },
}));

const PulseDot = styled('div')(({ plancolor }) => ({
  position: 'absolute',
  top: -4,
  right: -4,
  width: 12,
  height: 12,
  borderRadius: '50%',
  background: plancolor === 'primary' 
    ? '#4f46e5'
    : plancolor === 'warning'
    ? '#d97706'
    : '#4b5563',
  animation: `${pulse} 2s infinite`,
}));

export default function FloatingPlanButton() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const [currentPlan, setCurrentPlan] = useState('');

  useEffect(() => {
    if (!user?.id) return;

    axios.get(`${BASE_URL}/api/subscriptions/user-plan/${user.id}`)
      .then(response => {
        const plan = response.data.currentPlan || 'Free Plan';
        setCurrentPlan(plan.trim());
      })
      .catch(() => setCurrentPlan('Free Plan'));
  }, [user?.id]);

  const getPlanDetails = () => {
    const planLower = currentPlan.toLowerCase();

    if (planLower.includes('one-time')) {
      return {
        color: 'primary',
        label: 'One-Time Access',
        tooltip: 'Premium access with one-time payment'
      };
    } else if (planLower.includes('inclusive') || planLower.includes('all-inclusive')) {
      return {
        color: 'warning',
        label: 'All-Inclusive Bundle',
        tooltip: 'Full VIP access with all features'
      };
    } else {
      return {
        color: 'secondary',
        label: 'Free Plan',
        tooltip: 'Basic access with limited features'
      };
    }
  };

  const { color, label, tooltip } = getPlanDetails();

  return (
    <Tooltip title={tooltip} arrow placement="left">
      <StyledButton
        variant="contained"
        plancolor={color}
        onClick={() => navigate('/subscription')}
        startIcon={<WorkspacePremiumIcon />}
      >
        {label}
        <PulseDot plancolor={color} />
      </StyledButton>
    </Tooltip>
  );
}
