import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Chip,
  Input,
  Divider,
  Stack,
  FormLabel,
  CircularProgress,
  Alert,
  // Grid,
  Avatar
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const KYC = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [formData, setFormData] = useState({
    home_address: '',
    nin: '',
    idCard: null,
    proofOfAddress: null,
    guarantor1: { name: '', phone: '', email: '', relationship: '', document: null },
    guarantor2: { name: '', phone: '', email: '', relationship: '', document: null },
  });
  const [status, setStatus] = useState('Pending');
  const [loading, setLoading] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [filePreviews, setFilePreviews] = useState({
    idCard: null,
    proofOfAddress: null,
    guarantor1_document: null,
    guarantor2_document: null
  });

  // Check existing KYC status on load
  useEffect(() => {
    const checkKYCStatus = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/kyc/${caregiverId}`);
        if (res.data.success) {
          setStatus(res.data.data.status);
          setKycSubmitted(true);
          setRejectionReason(res.data.data.admin_notes || '');
          
          // Pre-fill form if rejected
          if (res.data.data.status === 'Rejected') {
            const kycData = res.data.data;
            setFormData({
              home_address: kycData.home_address,
              nin: kycData.nin,
              idCard: null,
              proofOfAddress: null,
              guarantor1: { 
                name: kycData.guarantor1_name,
                phone: kycData.guarantor1_phone,
                email: kycData.guarantor1_email,
                relationship: kycData.guarantor1_relationship,
                document: null
              },
              guarantor2: { 
                name: kycData.guarantor2_name,
                phone: kycData.guarantor2_phone,
                email: kycData.guarantor2_email,
                relationship: kycData.guarantor2_relationship,
                document: null
              }
            });

            // Set file previews from existing paths
            setFilePreviews({
              idCard: kycData.id_card_path ? `${BASE_URL}/uploads/kyc/${kycData.id_card_path}` : null,
              proofOfAddress: kycData.proof_of_address_path ? `${BASE_URL}/uploads/kyc/${kycData.proof_of_address_path}` : null,
              guarantor1_document: kycData.guarantor1_document_path ? `${BASE_URL}/kyc/uploads/${kycData.guarantor1_document_path}` : null,
              guarantor2_document: kycData.guarantor2_document_path ? `${BASE_URL}/kyc/uploads/${kycData.guarantor2_document_path}` : null
            });
          }
        }
      } catch (err) {
        console.log('No existing KYC record');
      }
    };

    if (caregiverId) checkKYCStatus();
  }, [caregiverId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGuarantorChange = (e, index) => {
    const { name, value } = e.target;
    const key = `guarantor${index}`;
    setFormData(prev => ({
      ...prev,
      [key]: { ...prev[key], [name]: value },
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    
    if (!file) return;

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);

    if (name.includes('guarantor')) {
      const [, index] = name.split('_');
      const key = `guarantor${index}`;
      setFormData(prev => ({
        ...prev,
        [key]: { ...prev[key], document: file },
      }));
      setFilePreviews(prev => ({
        ...prev,
        [`guarantor${index}_document`]: previewUrl
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: file }));
      setFilePreviews(prev => ({
        ...prev,
        [name]: previewUrl
      }));
    }
  };

  const handleSubmit = async () => {
    if (!caregiverId) return;

    setLoading(true);
    const formPayload = new FormData();

    // Append basic info
    formPayload.append('caregiver_id', caregiverId);
    formPayload.append('home_address', formData.home_address);
    formPayload.append('nin', formData.nin);

    // Append files
    if (formData.idCard) formPayload.append('id_card', formData.idCard);
    if (formData.proofOfAddress) formPayload.append('proof_of_address', formData.proofOfAddress);

    // Append guarantor data
    formPayload.append('guarantor1_name', formData.guarantor1.name);
    formPayload.append('guarantor1_phone', formData.guarantor1.phone);
    formPayload.append('guarantor1_email', formData.guarantor1.email);
    formPayload.append('guarantor1_relationship', formData.guarantor1.relationship);
    if (formData.guarantor1.document) formPayload.append('guarantor1_doc', formData.guarantor1.document);

    formPayload.append('guarantor2_name', formData.guarantor2.name);
    formPayload.append('guarantor2_phone', formData.guarantor2.phone);
    formPayload.append('guarantor2_email', formData.guarantor2.email);
    formPayload.append('guarantor2_relationship', formData.guarantor2.relationship);
    if (formData.guarantor2.document) formPayload.append('guarantor2_doc', formData.guarantor2.document);

    try {
      const endpoint = status === 'Rejected' 
        ? `${BASE_URL}/api/caregivers/kyc/caregiver/${caregiverId}`
        : `${BASE_URL}/api/caregivers/kyc`;
      
      const method = status === 'Rejected' ? 'patch' : 'post';

      const response = await axios[method](endpoint, formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        setStatus('Pending');
        setKycSubmitted(true);
        setRejectionReason('');
      }
    } catch (error) {
      console.error('KYC submission failed:', error.response?.data || error.message);
      alert(error.response?.data?.message || 'KYC submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditKYC = () => {
    setKycSubmitted(false);
  };

  if (kycSubmitted) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            KYC Verification Status
          </Typography>
          <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
            <Chip
              label={`Status: ${status}`}
              color={
                status?.trim()?.toLowerCase() === 'approved' ? 'success' :
                status?.trim()?.toLowerCase() === 'rejected' ? 'error' : 'warning'
              }
              sx={{ 
                mb: 3,
                fontWeight: 'bold',
                fontSize: '0.875rem',
              }}
            />
            
            {status === 'Rejected' && (
              <>
                <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle2">Rejection Reason:</Typography>
                  <Typography>{rejectionReason}</Typography>
                </Alert>
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleEditKYC}
                  sx={{ mb: 2 }}
                >
                  Update and Resubmit KYC
                </Button>
              </>
            )}
            
            {status === 'Pending' && (
              <Typography>
                Your KYC application is under review. We will notify you once Approved.
              </Typography>
            )}
            
            {status === 'Approved' && (
              <Typography>
                Your KYC verification is complete. Thank you!
              </Typography>
            )}
          </Paper>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>
          {status === 'Rejected' ? 'Update Your KYC Information' : 'KYC Verification'}
        </Typography>
        {status === 'Rejected' && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            Please correct the issues mentioned and resubmit your KYC application.
          </Alert>
        )}

        <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
          <Typography variant="h6" gutterBottom>Personal Information</Typography>
          <Stack spacing={2} sx={{ mb: 3 }}>
            <TextField
              label="Home Address"
              name="home_address"
              value={formData.home_address}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              label="National Identification Number (NIN)"
              name="nin"
              value={formData.nin}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <Box>
              <FormLabel required>ID Card</FormLabel>
              <Input 
                fullWidth 
                type="file" 
                name="idCard" 
                onChange={handleFileChange}
                inputProps={{ accept: 'image/*,.pdf' }}
                required
              />
              {filePreviews.idCard && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">Preview:</Typography>
                  <Avatar 
                    src={filePreviews.idCard} 
                    variant="rounded"
                    sx={{ width: 100, height: 100, mt: 1 }}
                    onClick={() => window.open(filePreviews.idCard, '_blank')}
                  />
                </Box>
              )}
            </Box>
            <Box>
              <FormLabel required>Proof of Address</FormLabel>
              <Input 
                fullWidth 
                type="file" 
                name="proofOfAddress" 
                onChange={handleFileChange}
                inputProps={{ accept: 'image/*,.pdf' }}
                required
              />
              {filePreviews.proofOfAddress && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">Preview:</Typography>
                  <Avatar 
                    src={filePreviews.proofOfAddress} 
                    variant="rounded"
                    sx={{ width: 100, height: 100, mt: 1 }}
                    onClick={() => window.open(filePreviews.proofOfAddress, '_blank')}
                  />
                </Box>
              )}
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          {[1, 2].map(index => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>Guarantor {index} Details</Typography>
              <Stack spacing={2}>
                <TextField
                  label="Full Name"
                  name="name"
                  value={formData[`guarantor${index}`].name}
                  onChange={(e) => handleGuarantorChange(e, index)}
                  fullWidth
                  required
                />
                <TextField
                  label="Phone Number"
                  name="phone"
                  value={formData[`guarantor${index}`].phone}
                  onChange={(e) => handleGuarantorChange(e, index)}
                  fullWidth
                  required
                />
                <TextField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData[`guarantor${index}`].email}
                  onChange={(e) => handleGuarantorChange(e, index)}
                  fullWidth
                />
                <TextField
                  label="Relationship"
                  name="relationship"
                  value={formData[`guarantor${index}`].relationship}
                  onChange={(e) => handleGuarantorChange(e, index)}
                  fullWidth
                  required
                />
                <Box>
                  <FormLabel>Guarantor Document</FormLabel>
                  <Input
                    fullWidth
                    type="file"
                    name={`guarantor_${index}`}
                    onChange={handleFileChange}
                    inputProps={{ accept: 'image/*,.pdf' }}
                  />
                  {filePreviews[`guarantor${index}_document`] && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption">Preview:</Typography>
                      <Avatar 
                        src={filePreviews[`guarantor${index}_document`]} 
                        variant="rounded"
                        sx={{ width: 100, height: 100, mt: 1 }}
                        onClick={() => window.open(filePreviews[`guarantor${index}_document`], '_blank')}
                      />
                    </Box>
                  )}
                </Box>
              </Stack>
            </Box>
          ))}

          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            disabled={loading}
            sx={{ 
              backgroundColor: '#648E87', 
              '&:hover': { backgroundColor: '#4e726d' },
              mt: 2
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit for Verification'}
          </Button>
        </Paper>
      </Box>
    </DashboardLayout>
  );
};

export default KYC;