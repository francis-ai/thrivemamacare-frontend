import React, { useCallback, useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Pagination, Button, Dialog, DialogTitle, DialogContent, Chip, useMediaQuery, useTheme, Divider, DialogActions,
  FormGroup, FormControlLabel, Checkbox
} from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import { Snackbar, Alert } from '@mui/material';
import { Visibility, Edit, Delete } from '@mui/icons-material';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Completed':
      return 'success';
    default:
      return 'default';
  }
};

const MyRequests = () => {
  const { user } = useAuthUser();
  const userId = user?.id;
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [page, setPage] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const rowsPerPage = 10;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [editRequestData, setEditRequestData] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  
  const [editPreferences, setEditPreferences] = useState({
    age_range: [],
    ethnicity: 'Any',
    religion: 'Any'
  });

  const NIGERIAN_STATES = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

  const ETHNICITIES = [
    'Any',
    'Yoruba', 'Igbo', 'Hausa', 'Fulani', 'Kanuri', 'Tiv', 'Ijaw', 'Urhobo', 'Other'
  ];

  const RELIGIONS = [
    'Any',
    'Christian', 'Muslim', 'Traditional', 'Other'
  ];

  const parsePreferences = (pref) => {
    try {
      if (!pref) return { age_range: [], ethnicity: 'Any', religion: 'Any' };
      return typeof pref === 'string' ? JSON.parse(pref) : pref;
    } catch {
      return { age_range: [], ethnicity: 'Any', religion: 'Any' };
    }
  };

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/my-caregiver-requests/${userId}`);
      const requestRows = Array.isArray(res.data?.requests) ? res.data.requests : [];
      setRequests(requestRows);
      setFilteredRequests(requestRows);
      console.log("Caregiver Request (API Response):", res.data.requests); 
    } catch (error) {
      console.error('Failed to fetch caregiver requests:', error);
      setRequests([]);
      setFilteredRequests([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchRequests();
    }
  }, [userId, fetchRequests]);

  // ✅ Update request
  const submitEditRequest = async () => {
    try {
      const payload = {
        service: editRequestData.service || editRequestData.primary_role || '',
        duration: editRequestData.duration,
        address: editRequestData.address,
        notes: editRequestData.notes,
        status: editRequestData.status,
        offer_amount: editRequestData.offer_amount,

        // 🔥 NEW FIELDS
        primary_role: editRequestData.primary_role,
        accommodation_type: editRequestData.accommodation_type,
        state: editRequestData.state,
        preferences: editPreferences
      };

      console.log("🚀 UPDATE PAYLOAD:", payload);

      await axios.put(
        `${BASE_URL}/api/users/update-my-caregiver-requests/${editRequestData.id}`,
        payload
      );

      setEditModalOpen(false);
      setEditRequestData(null);
      fetchRequests();

      setSuccessMessage('Request updated successfully!');
      setShowSnackbar(true);
    } catch (error) {
      console.error('❌ Error updating request:', error);
    }
  };

  const handleEditRequest = (request) => {
    setEditRequestData(request);

    const parsed = parsePreferences(request.preferences);

    setEditPreferences({
      age_range: parsed.age_range || [],
      ethnicity: parsed.ethnicity || 'Any',
      religion: parsed.religion || 'Any'
    });

    setEditModalOpen(true);
  };

  // ✅ Show delete confirmation modal
  const handleDeleteRequest = (id) => {
    setRequestToDelete(id);
    setDeleteDialogOpen(true);
  };

  // ✅ Confirm delete action
  const confirmDeleteRequest = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/users/delete-my-caregiver-requests/${requestToDelete}`);
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      fetchRequests(); // ✅ refresh list
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  // ✅ Cancel delete
  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setRequestToDelete(null);
  };

  useEffect(() => {
    const filtered = requests.filter(
      (request) =>
        (request.service || request.primary_role || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (request.status || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
    setPage(0);
  }, [searchTerm, requests]);


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setOpenModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditRequestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPreferenceChange = (e) => {
    const { name, value } = e.target;
    setEditPreferences((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditAgeRangeToggle = (range) => {
    setEditPreferences((prev) => ({
      ...prev,
      age_range: prev.age_range.includes(range)
        ? prev.age_range.filter((r) => r !== range)
        : [...prev.age_range, range]
    }));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

  const prefs = parsePreferences(selectedRequest?.preferences);

  return (
    <DashboardLayout>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" gutterBottom>
          My Helper Requests
        </Typography>

        <TextField
          label="Search by service or status"
          variant="outlined"
          margin="normal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          fullWidth
          sx={{ maxWidth: 500, mb: 2 }}
        />

        {/* Success message */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={3000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert onClose={() => setShowSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            {successMessage}
          </Alert>
        </Snackbar>

        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#648E87' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Service</TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Duration</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Accomodation Type</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Addresss</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </>
                )}
                {isMobile && (
                  <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 6} align="center">
                    No request yet
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((request) => (
                    <TableRow key={request.id} hover>
                      <TableCell>{request.service}</TableCell>
                      {!isMobile && (
                        <>
                          <TableCell>{request.duration}</TableCell>
                          <TableCell>{request.accommodation_type || '-'}</TableCell>
                          <TableCell>{request.address}</TableCell>
                          <TableCell>
                            <Chip
                              label={request.status}
                              color={getStatusColor(request.status)}
                              size="small"
                              sx={{ fontWeight: 'bold' }}
                            />
                          </TableCell>
                          <TableCell>
                            <Button onClick={() => handleViewDetails(request)}>
                              <Visibility color="secondary" />
                            </Button>
                            <Button onClick={() => handleEditRequest(request)}>
                              <Edit color="primary" />
                            </Button>
                            <Button onClick={() => handleDeleteRequest(request.id)}>
                              <Delete color="error" />
                            </Button>
                          </TableCell>
                        </>
                      )}
                      {isMobile && (
                        <TableCell>
                          <Button onClick={() => handleViewDetails(request)}>
                            <Visibility color="secondary" />
                          </Button>
                          <Button onClick={() => handleEditRequest(request)}>
                            <Edit color="primary" />
                          </Button>
                          <Button onClick={() => handleDeleteRequest(request.id)}>
                            <Delete color="error" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2} display="flex" justifyContent="flex-end">
          <Pagination
            count={Math.ceil(filteredRequests.length / rowsPerPage)}
            page={page + 1}
            onChange={(e, newPage) => handleChangePage(e, newPage - 1)}
            color="primary"
          />
        </Box>

        {/* Modal */}
        <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
          <DialogTitle>Request Details</DialogTitle>
          <DialogContent>
            {selectedRequest && (
              <Box>
                <Typography variant="subtitle1">
                  <strong>Service:</strong> {selectedRequest.service}
                </Typography>
                <Typography variant="body1">
                  <strong>Duration:</strong> {selectedRequest.duration}
                </Typography>
                <Typography variant="body1">
                  <strong>Accommodation:</strong> {selectedRequest.accommodation_type || '-'}
                </Typography>
                <Typography variant="body1">
                  <strong>State:</strong> {selectedRequest.state || '-'}
                </Typography>
                <Typography variant="body1">
                  <strong>Address:</strong> {selectedRequest.address}
                </Typography>
                <Typography variant="body1">
                  <strong>Note:</strong> {selectedRequest.notes}
                </Typography>
                <Typography variant="body1">
                  <strong>Offer Amount:</strong> {selectedRequest.offer_amount}
                </Typography>
                <Typography variant="body1">
                  <strong>Date:</strong> {selectedRequest.created_at}
                </Typography>

                <Typography><strong>Primary Role:</strong> {selectedRequest.primary_role}</Typography>
                <Typography><strong>Accommodation:</strong> {selectedRequest.accommodation_type}</Typography>
                <Typography><strong>State:</strong> {selectedRequest.state}</Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2"><strong>Preferences</strong></Typography>
                <Typography>Age Range: {prefs.age_range?.join(', ') || 'Any'}</Typography>
                <Typography>Ethnicity: {prefs.ethnicity}</Typography>
                <Typography>Religion: {prefs.religion}</Typography>
                <Typography variant="body1">
                  <strong>Status:</strong>{' '}
                  <Chip
                    label={selectedRequest.status}
                    color={getStatusColor(selectedRequest.status)}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Typography>
                <Divider sx={{ my: 2 }} />
              </Box>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal for Edit/Update */}
        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Edit Caregiver Request</DialogTitle>
          <DialogContent>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <TextField
                label="Service"
                name="service"
                value={editRequestData?.service || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Duration"
                name="duration"
                value={editRequestData?.duration || ''}
                onChange={handleEditChange}
                fullWidth
              />
              
              <TextField
                label="Address"
                name="address"
                value={editRequestData?.address || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Note"
                name="notes"
                value={editRequestData?.notes || ''}
                onChange={handleEditChange}
                fullWidth
              />
              <TextField
                label="Offer Amount"
                name="offer_amount"
                value={editRequestData?.offer_amount || ''}
                onChange={handleEditChange}
                fullWidth
              />

              <FormControl fullWidth margin="normal">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={editRequestData?.status || 'Open'}
                  label="Status"
                  onChange={handleEditChange}
                >
                  <MenuItem value="Open">Open</MenuItem>
                  <MenuItem value="Close">Close</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Primary Role</InputLabel>
                <Select
                  name="primary_role"
                  value={editRequestData?.primary_role || ''}
                  onChange={handleEditChange}
                  sx={{ borderRadius: 2, backgroundColor: '#fff'}}
                  label="Primary Role"
                >
                  <MenuItem value="Nanny">Nanny</MenuItem>
                  <MenuItem value="Domestic Help">Domestic Help</MenuItem>
                  <MenuItem value="Special Needs Child Caregiver">Special Needs Child Caregiver</MenuItem>
                  <MenuItem value="Housekeeper">Housekeeper</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Accommodation Type</InputLabel>
                <Select
                  name="accommodation_type"
                  value={editRequestData?.accommodation_type || ''}
                  onChange={handleEditChange}
                  sx={{ borderRadius: 2, backgroundColor: '#fff'}}
                  label="Accomodation Type"
                >
                  <MenuItem value="Live-in">Live-in</MenuItem>
                  <MenuItem value="Live-out">Live-out</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined" required>
                <InputLabel>State </InputLabel>
                <Select
                  name="state"
                  value={editRequestData?.state || ''}
                  onChange={handleEditChange}
                  label="Your State"
                  sx={{ borderRadius: 2, backgroundColor: '#fff'}}
                >
                  <MenuItem value="">Select State</MenuItem>
                  {NIGERIAN_STATES.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Preferences
              </Typography>

              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Preferred Age Range
                </Typography>
                <FormGroup row>
                  {['21-30', '31-35', '36+'].map((range) => (
                    <FormControlLabel
                      key={range}
                      control={
                        <Checkbox
                          checked={editPreferences.age_range.includes(range)}
                          onChange={() => handleEditAgeRangeToggle(range)}
                        />
                      }
                      label={range}
                    />
                  ))}
                </FormGroup>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Ethnicity Preference</InputLabel>
                <Select
                  name="ethnicity"
                  value={editPreferences.ethnicity}
                  onChange={handleEditPreferenceChange}
                  label="Ethnicity Preference"
                  sx={{ borderRadius: 2, backgroundColor: '#fff' }}
                >
                  {ETHNICITIES.map((eth) => (
                    <MenuItem key={eth} value={eth}>
                      {eth}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Religion Preference</InputLabel>
                <Select
                  name="religion"
                  value={editPreferences.religion}
                  onChange={handleEditPreferenceChange}
                  label="Religion Preference"
                  sx={{ borderRadius: 2, backgroundColor: '#fff' }}
                >
                  {RELIGIONS.map((rel) => (
                    <MenuItem key={rel} value={rel}>
                      {rel}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button onClick={submitEditRequest} variant="contained" color="primary">
                Save Changes
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
        
        {/* Modal For Delete */}
        <Dialog open={deleteDialogOpen} onClose={cancelDelete}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to delete this request?</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={cancelDelete} color="primary">
              Cancel
            </Button>
            <Button onClick={confirmDeleteRequest} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

      </Box>
    </DashboardLayout>
  );
};

export default MyRequests;