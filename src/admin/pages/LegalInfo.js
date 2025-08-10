import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab } from '@mui/material';
import Terms from '../components/Terms';
import PrivacyPolicy from '../components/PrivacyPolicy';
import FAQs from '../components/FAQs';
import CaregiverTerms from '../components/CaregiverTerms';
import ContactInfo from '../components/ContactInfo'; // ✅ Import

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function LegalInfo() {
  const [tab, setTab] = useState(0);
  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Box sx={{ p: 3, maxWidth: 'lg', mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        Legal Information
      </Typography>

      <Tabs
        value={tab}
        onChange={handleChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Terms & Conditions" />
        <Tab label="Privacy Policy" />
        <Tab label="FAQs" />
        <Tab label="Caregiver Terms" />
        <Tab label="Contact Info" /> {/* ✅ Added */}
      </Tabs>

      <TabPanel value={tab} index={0}>
        <Typography variant="h5" gutterBottom>Terms and Conditions</Typography>
        <Terms />
      </TabPanel>

      <TabPanel value={tab} index={1}>
        <Typography variant="h5" gutterBottom>Privacy Policy</Typography>
        <PrivacyPolicy />
      </TabPanel>

      <TabPanel value={tab} index={2}>
        <Typography variant="h5" gutterBottom>FAQs</Typography>
        <FAQs />
      </TabPanel>

      <TabPanel value={tab} index={3}>
        <Typography variant="h5" gutterBottom>Caregiver Terms</Typography>
        <CaregiverTerms />
      </TabPanel>

      <TabPanel value={tab} index={4}>
        <Typography variant="h5" gutterBottom>Contact Info</Typography>
        <ContactInfo />
      </TabPanel>
    </Box>
  );
}
