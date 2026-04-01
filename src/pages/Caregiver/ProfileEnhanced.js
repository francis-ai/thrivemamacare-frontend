import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Avatar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '../../components/Caregiver/DashboardLayout';
import axios from 'axios';
import { useAuthCaregiver } from '../../context/AuthContextCaregiver';

const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Enhanced Caregiver Profile Page with Matching System
 * Includes: birthday, primary_role, accommodation_type, state, ethnicity, religion, certifications
 */
const CaregiverProfileEnhanced = () => {
  const { caregiver } = useAuthCaregiver();
  const caregiverId = caregiver?.id;

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Basic profile fields
  const [basicInfo, setBasicInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
    profile_image: null,
  });

  // Matching system fields
  const [matchingInfo, setMatchingInfo] = useState({
    birthday: '',
    primary_role: '', // Domestic Help, Nanny, Special Needs Child Caregiver, Housekeeper
    accommodation_type: '', // Live-in or Live-out
    state: '', // Nigerian state
    ethnicity: '',
    religion: '',
    years_of_experience: 0,
  });

  // Professional fields
  const [professionalInfo, setProfessionalInfo] = useState({
    speciality: '',
    salary_range: '',
    certifications: [], // Array of strings
  });

  const [preview, setPreview] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [newCertification, setNewCertification] = useState('');
  const [activeTab, setActiveTab] = useState('basic'); // basic, matching, professional

  const normalizeCertifications = (value) => {
    if (Array.isArray(value)) return value;
    if (!value) return [];

    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return value
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    return [];
  };

  const normalizeDateForInput = (value) => {
    if (!value) return '';
    if (typeof value === 'string') return value.slice(0, 10);

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  // Nigerian states
  const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const ETHNICITIES = [
    'Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Kanuri', 'Tiv', 'Ijaw', 'Urhobo', 'Other'
  ];

  const RELIGIONS = [
    'Christian', 'Muslim', 'Traditional', 'Other'
  ];

  const PRIMARY_ROLES = [
    'Domestic Help',
    'Nanny',
    'Special Needs Child Caregiver',
    'Housekeeper'
  ];

  const ACCOMMODATION_TYPES = ['Live-in', 'Live-out'];

  // Fetch caregiver profile
  useEffect(() => {
    if (!caregiverId) return;

    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/profile/${caregiverId}`);
        const data = res.data;

        setBasicInfo({
          fullName: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          gender: data.gender || '',
          profile_image: data.profile_image || null,
        });

        setMatchingInfo({
          birthday: normalizeDateForInput(data.birthday),
          primary_role: data.primary_role || '',
          accommodation_type: data.accommodation_type || '',
          state: data.state || '',
          ethnicity: data.ethnicity || '',
          religion: data.religion || '',
          years_of_experience: data.years_of_experience || 0,
        });

        setProfessionalInfo({
          speciality: data.speciality || '',
          salary_range: data.salary_range || '',
          certifications: normalizeCertifications(data.certifications),
        });

        if (data.profile_image) {
          setPreview(`${BASE_URL}/uploads/caregivers/${data.profile_image}`);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setErrorMessage('Failed to load profile');
      }
    };

    fetchProfile();
  }, [caregiverId]);

  // Handle form changes
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleMatchingChange = (e) => {
    const { name, value } = e.target;
    setMatchingInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfessionalChange = (e) => {
    const { name, value } = e.target;
    setProfessionalInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreviewFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Add certification
  const addCertification = () => {
    if (newCertification.trim()) {
      setProfessionalInfo((prev) => ({
        ...prev,
        certifications: [...normalizeCertifications(prev.certifications), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  // Remove certification
  const removeCertification = (index) => {
    setProfessionalInfo((prev) => ({
      ...prev,
      certifications: normalizeCertifications(prev.certifications).filter((_, i) => i !== index)
    }));
  };

  // Submit profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('caregiver_id', caregiverId);
      
      // Basic info
      formData.append('name', basicInfo.fullName);
      formData.append('phone', basicInfo.phone);
      formData.append('gender', basicInfo.gender);
      formData.append('address', basicInfo.address);
      
      // Matching info
      formData.append('birthday', normalizeDateForInput(matchingInfo.birthday));
      formData.append('primary_role', matchingInfo.primary_role);
      formData.append('accommodation_type', matchingInfo.accommodation_type);
      formData.append('state', matchingInfo.state);
      formData.append('ethnicity', matchingInfo.ethnicity);
      formData.append('religion', matchingInfo.religion);
      formData.append('years_of_experience', matchingInfo.years_of_experience);
      
      // Professional info
      formData.append('speciality', professionalInfo.speciality);
      formData.append('salary_range', professionalInfo.salary_range);
      formData.append('certifications', JSON.stringify(normalizeCertifications(professionalInfo.certifications)));
      
      // Profile image
      if (previewFile) {
        formData.append('profile_image', previewFile);
      }

      await axios.post(
        `${BASE_URL}/api/caregivers/update-profile`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#648E87' }}>
          My Profile
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Tab Navigation */}
        <Box sx={{ display: 'flex', gap: 1, mb: 3, borderBottom: '1px solid #eee' }}>
          <Button
            onClick={() => setActiveTab('basic')}
            sx={{
              pb: 1,
              color: activeTab === 'basic' ? '#648E87' : '#999',
              borderBottom: activeTab === 'basic' ? '3px solid #648E87' : 'none',
              textTransform: 'none',
              fontSize: '16px',
            }}
          >
            Basic Info
          </Button>
          <Button
            onClick={() => setActiveTab('matching')}
            sx={{
              pb: 1,
              color: activeTab === 'matching' ? '#648E87' : '#999',
              borderBottom: activeTab === 'matching' ? '3px solid #648E87' : 'none',
              textTransform: 'none',
              fontSize: '16px',
            }}
          >
            Availability & Preferences
          </Button>
          <Button
            onClick={() => setActiveTab('professional')}
            sx={{
              pb: 1,
              color: activeTab === 'professional' ? '#648E87' : '#999',
              borderBottom: activeTab === 'professional' ? '3px solid #648E87' : 'none',
              textTransform: 'none',
              fontSize: '16px',
            }}
          >
            Professional
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* BASIC INFO TAB */}
          {activeTab === 'basic' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Basic Information
                </Typography>

                {/* Profile Picture */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                  <Avatar
                    src={preview}
                    sx={{ width: 120, height: 120, margin: '0 auto', mb: 2 }}
                  />
                  <input
                    type="file"
                    onChange={handleImageChange}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="image-input"
                  />
                  <label htmlFor="image-input">
                    <Button variant="outlined" component="span" size="small">
                      Change Photo
                    </Button>
                  </label>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="fullName"
                      value={basicInfo.fullName}
                      onChange={handleBasicChange}
                      disabled
                      sx={{ width: 250}}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={basicInfo.email}
                      disabled
                      sx={{ width: 250}}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      value={basicInfo.phone}
                      onChange={handleBasicChange}
                      sx={{ width: 250}}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        name="gender"
                        value={basicInfo.gender}
                        onChange={handleBasicChange}
                        label="Gender"
                        sx={{ width: 250}}
                      >
                        <MenuItem value="">Select Gender</MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={basicInfo.address}
                      onChange={handleBasicChange}
                      multiline
                      rows={2}
                      sx={{ width: 250}}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* MATCHING/AVAILABILITY TAB */}
          {activeTab === 'matching' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Availability & Matching Preferences
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ color: '#333' }}>
                    These details help families find you more easily. Fill them in completely for better match results.
                  </Typography>
                </Alert>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="birthday"
                      type="date"
                      value={matchingInfo.birthday}
                      onChange={handleMatchingChange}
                      InputLabelProps={{ shrink: true }}
                      sx={{ width: 250}}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Primary Role</InputLabel>
                      <Select
                        name="primary_role"
                        value={matchingInfo.primary_role}
                        onChange={handleMatchingChange}
                        label="Primary Role"
                        sx={{ width: 250}}
                      >
                        <MenuItem value="">Select Role</MenuItem>
                        {PRIMARY_ROLES.map((role) => (
                          <MenuItem key={role} value={role}>
                            {role}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Accommodation Type</InputLabel>
                      <Select
                        name="accommodation_type"
                        value={matchingInfo.accommodation_type}
                        onChange={handleMatchingChange}
                        label="Accommodation Type"
                        sx={{ width: 250}}
                      >
                        <MenuItem value="">Select Type</MenuItem>
                        {ACCOMMODATION_TYPES.map((type) => (
                          <MenuItem key={type} value={type}>
                            {type}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Select
                        name="state"
                        value={matchingInfo.state}
                        onChange={handleMatchingChange}
                        label="State"
                        sx={{width:250}}
                      >
                        <MenuItem value="">Select State</MenuItem>
                        {NIGERIAN_STATES.map((state) => (
                          <MenuItem key={state} value={state}>
                            {state}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Ethnicity (Optional)</InputLabel>
                      <Select
                        name="ethnicity"
                        value={matchingInfo.ethnicity}
                        onChange={handleMatchingChange}
                        label="Ethnicity"
                        sx={{ width: 250}}
                      >
                        <MenuItem value="">Prefer Not to Say</MenuItem>
                        {ETHNICITIES.map((eth) => (
                          <MenuItem key={eth} value={eth}>
                            {eth}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Religion (Optional)</InputLabel>
                      <Select
                        name="religion"
                        value={matchingInfo.religion}
                        onChange={handleMatchingChange}
                        label="Religion"
                        sx={{ width: 250}}
                      >
                        <MenuItem value="">Prefer Not to Say</MenuItem>
                        {RELIGIONS.map((rel) => (
                          <MenuItem key={rel} value={rel}>
                            {rel}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Years of Experience"
                      name="years_of_experience"
                      type="number"
                      value={matchingInfo.years_of_experience}
                      onChange={handleMatchingChange}
                      inputProps={{ min: 0 }}
                      sx={{ width: 250}}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* PROFESSIONAL TAB */}
          {activeTab === 'professional' && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Professional Information
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Speciality/Expertise"
                      name="speciality"
                      value={professionalInfo.speciality}
                      onChange={handleProfessionalChange}
                      multiline
                      rows={2}
                      sx={{ width: 250}}
                      placeholder="e.g., Infant care, special needs support, cooking, etc."
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Expected Salary Range"
                      name="salary_range"
                      value={professionalInfo.salary_range}
                      onChange={handleProfessionalChange}
                      sx={{ width: 250}}
                      placeholder="e.g., ₦50,000 - ₦100,000"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Certifications & Qualifications
                      </Typography>
                      
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          size="small"
                          value={newCertification}
                          onChange={(e) => setNewCertification(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addCertification();
                            }
                          }}
                          placeholder="e.g., First Aid Certificate"
                          sx={{ flex: 1, width: 220 }}
                        />
                        <Button
                          variant="contained"
                          onClick={addCertification}
                          sx={{ bgcolor: '#648E87', color: 'white' }}
                        >
                          Add
                        </Button>
                      </Box>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {normalizeCertifications(professionalInfo.certifications).map((cert, index) => (
                          <Chip
                            key={index}
                            label={cert}
                            onDelete={() => removeCertification(index)}
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              sx={{ bgcolor: '#648E87', color: 'white', px: 4 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
            </Button>
          </Box>
        </form>
      </Box>
    </DashboardLayout>
  );
};

export default CaregiverProfileEnhanced;
