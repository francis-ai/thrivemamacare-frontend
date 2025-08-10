import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Snackbar,
  Alert
} from '@mui/material';
import { Edit, Delete, Add, Check, Close } from '@mui/icons-material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function SubscriptionPlans() {
  const [plans, setPlans] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    plan_name: '',
    plan_slug: '',
    price: 0,
    duration_days: null,
    profile_access_limit: null,
    features: [''],
    is_active: true
  });

  // Fetch all plans
  const fetchPlans = useCallback(async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/subscriptions/plans`);
      setPlans(data);
    } catch (error) {
      showSnackbar('Failed to fetch plans', 'error');
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Generate slug from plan name
  const generateSlug = (name) => {
    return name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  // Handle dialog open/close
  const handleDialogOpen = (plan = null) => {
    setCurrentPlan(plan);
    setErrors({});
    if (plan) {
      setFormData({
        plan_name: plan.plan_name,
        plan_slug: plan.plan_slug,
        price: plan.price,
        duration_days: plan.duration_days || null,
        profile_access_limit: plan.profile_access_limit || null,
        features: plan.features.length ? plan.features : [''],
        is_active: plan.is_active
      });
    } else {
      setFormData({
        plan_name: '',
        plan_slug: '',
        price: 0,
        duration_days: null,
        profile_access_limit: null,
        features: [''],
        is_active: true
      });
    }
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      if (name === 'plan_name' && !currentPlan) {
        newData.plan_slug = generateSlug(value);
      }
      return newData;
    });
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeatureField = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeatureField = (index) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.plan_name.trim()) {
      newErrors.plan_name = 'Plan name is required';
    }
    if (!formData.plan_slug.trim()) {
      newErrors.plan_slug = 'Slug is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        ...formData,
        price: formData.price || 0,
        duration_days: formData.duration_days || null,
        profile_access_limit: formData.profile_access_limit || null
      };

      if (currentPlan) {
        await axios.put(`${BASE_URL}/api/subscriptions/plans/${currentPlan.id}`, payload);
        showSnackbar('Plan updated successfully');
      } else {
        await axios.post(`${BASE_URL}/api/subscriptions/plans`, payload);
        showSnackbar('Plan created successfully');
      }
      fetchPlans();
      handleDialogClose();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle plan deletion
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`${BASE_URL}/api/subscriptions/plans/${id}`);
        showSnackbar('Plan deleted successfully');
        fetchPlans();
      } catch (error) {
        showSnackbar('Failed to delete plan', 'error');
      }
    }
  };

  // Handle status toggle
  const toggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`${BASE_URL}/api/subscriptions/plans/${id}/status`, {
        is_active: !currentStatus
      });
      showSnackbar('Plan status updated');
      fetchPlans();
    } catch (error) {
      showSnackbar('Failed to update status', 'error');
    }
  };

  // Snackbar helper
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Subscription Plans</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => handleDialogOpen()}
        >
          Add New Plan
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plan Name</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell align="right">Price (₦)</TableCell>
              <TableCell align="right">Duration (Days)</TableCell>
              <TableCell>Features</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>{plan.plan_name}</TableCell>
                <TableCell>{plan.plan_slug}</TableCell>
                <TableCell align="right">{plan.price.toLocaleString()}</TableCell>
                <TableCell align="right">
                  {plan.duration_days || 'Unlimited'}
                </TableCell>
                <TableCell>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {plan.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell align="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={plan.is_active}
                        onChange={() => toggleStatus(plan.id, plan.is_active)}
                        color="primary"
                      />
                    }
                    label={plan.is_active ? 'Active' : 'Inactive'}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton onClick={() => handleDialogOpen(plan)}>
                    <Edit color="primary" />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(plan.id)}>
                    <Delete color="error" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Plan Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth maxWidth="md">
        <DialogTitle>
          {currentPlan ? 'Edit Subscription Plan' : 'Create New Subscription Plan'}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Plan Name *"
              name="plan_name"
              value={formData.plan_name}
              onChange={handleInputChange}
              error={!!errors.plan_name}
              helperText={errors.plan_name}
              fullWidth
            />
            
            <TextField
              label="Plan Slug *"
              name="plan_slug"
              value={formData.plan_slug}
              onChange={handleInputChange}
              error={!!errors.plan_slug}
              helperText={errors.plan_slug || "URL-friendly identifier"}
              fullWidth
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Price (₦)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label="Duration (Days)"
                name="duration_days"
                type="number"
                value={formData.duration_days || ''}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="Leave empty for unlimited"
              />
              <TextField
                label="Profile Limit"
                name="profile_access_limit"
                type="number"
                value={formData.profile_access_limit || ''}
                onChange={handleInputChange}
                fullWidth
                inputProps={{ min: 1 }}
                helperText="Leave empty for unlimited"
              />
            </Box>
            
            <Typography variant="subtitle1">Features</Typography>
            {formData.features.map((feature, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  fullWidth
                />
                {formData.features.length > 1 && (
                  <IconButton onClick={() => removeFeatureField(index)}>
                    <Close color="error" />
                  </IconButton>
                )}
              </Box>
            ))}
            <Button 
              startIcon={<Add />} 
              onClick={addFeatureField}
              variant="outlined"
            >
              Add Feature
            </Button>
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    is_active: e.target.checked
                  }))}
                  color="primary"
                />
              }
              label={formData.is_active ? 'Active' : 'Inactive'}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={isLoading}
            startIcon={<Check />}
          >
            {isLoading ? 'Processing...' : currentPlan ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}