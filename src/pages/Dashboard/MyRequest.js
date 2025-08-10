import React, { useCallback, useState, useEffect } from 'react';
import {
  Box, Typography, TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, FormControl,
  InputLabel, Pagination, Button, Dialog, DialogTitle, DialogContent,  Chip, useMediaQuery, useTheme, Divider, DialogActions 
} from '@mui/material';
import DashboardLayout from '../../components/Dashboard/DashboardLayout';
import axios from 'axios';
import { useAuthUser } from '../../context/AuthContextUser';
import { Snackbar, Alert } from '@mui/material';

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


  // ✅ Define fetchRequests at the top level of the component
  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/my-caregiver-requests/${userId}`);
      setRequests(res.data.requests);
      setFilteredRequests(res.data.requests);
    } catch (error) {
      console.error('Failed to fetch caregiver requests:', error);
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
      await axios.put(
        `${BASE_URL}/api/users/update-my-caregiver-requests/${editRequestData.id}`,
        editRequestData
      );
      setEditModalOpen(false);
      setEditRequestData(null);
      fetchRequests(); // refresh list

      setSuccessMessage('Request updated successfully!');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error updating request:', error);
    }
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
        request.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.status.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleEditRequest = (request) => {
    setEditRequestData(request);
    setEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditRequestData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedRequest(null);
  };

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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Age Group</TableCell>
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
                          <TableCell>{request.age_group}</TableCell>
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
                            <Button
                              variant="outlined"
                              size="small"
                              color="secondary"
                              onClick={() => handleViewDetails(request)}
                              sx={{ mr: 1 }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="primary"
                              onClick={() => handleEditRequest(request)}
                              sx={{ mr: 1 }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              size="small"
                              color="error"
                              onClick={() => handleDeleteRequest(request.id)}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </>
                      )}
                      {isMobile && (
                        <TableCell>
                          <Button
                            variant="outlined"
                            size="small"
                            color="secondary"
                            onClick={() => handleViewDetails(request)}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            onClick={() => handleEditRequest(request)}
                            sx={{ mr: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            Delete
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
            count={Math.ceil(requests.length / rowsPerPage)}
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
                  <strong>Age Group:</strong> {selectedRequest.age_group}
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
                label="Age Group"
                name="age_group"
                value={editRequestData?.age_group || ''}
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