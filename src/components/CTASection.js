import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Container, useTheme, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCTASection = styled(Box)(({ theme }) => ({
  backgroundColor: '#000',
  padding: theme.spacing(8, 2),
  position: 'relative',
  overflow: 'hidden',
  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
}));

const CTAContainer = styled(Container)(({ theme }) => ({
  position: 'relative',
  zIndex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  padding: theme.spacing(4, 3),
  borderRadius: theme.spacing(0),
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
  maxWidth: '900px !important',
}));

const CTATitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.5rem',
  fontWeight: 600,
  marginBottom: theme.spacing(4),
  color: '#648E87',
  lineHeight: 1.2,
  [theme.breakpoints.down('md')]: {
    fontSize: '2rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.75rem',
  },
}));

const CTAButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  flexWrap: 'wrap',
  justifyContent: 'center',
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
    alignItems: 'center',
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(0),
  textTransform: 'none',
  minWidth: '180px',
  backgroundColor: '#648E87',
  color: '#fff',
  '&:hover': {
     backgroundColor: '#30554fff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  transition: 'all 0.3s ease',
}));

const SecondaryButton = styled(Button)(({ theme }) => ({
  padding: theme.spacing(1.5, 4),
  fontSize: '1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(0),
  textTransform: 'none',
  minWidth: '180px',
  backgroundColor: 'transparent',
  color: '#dd700a',
  border: `2px solid #dd700a`,
  '&:hover': {
    backgroundColor: '#dd700a',
    color: '#fff',
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  transition: 'all 0.3s ease',
}));

const CTASection = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledCTASection>
      <CTAContainer>
        <CTATitle variant="h2">
          Find the care you need from<br />someone you trust.
        </CTATitle>
        <CTAButtonGroup>
          <SecondaryButton
            component={Link}
            to="/register"
            variant="outlined"
            size={isMobile ? "medium" : "large"}
          >
            Post a Job
          </SecondaryButton>
          <PrimaryButton
            component={Link}
            to="/register"
            variant="contained"
            size={isMobile ? "medium" : "large"}
          >
            Get Hired
          </PrimaryButton>
        </CTAButtonGroup>
      </CTAContainer>
    </StyledCTASection>
  );
};

export default CTASection;