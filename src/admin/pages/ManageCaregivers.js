import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  TableContainer,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useMediaQuery,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Cancel from '@mui/icons-material/Cancel';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DescriptionIcon from '@mui/icons-material/Description';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const ManageCaregivers = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [caregivers, setCaregivers] = useState([]);
  const [newStatus, setNewStatus] = useState('');
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
  const [kycDetails, setKycDetails] = useState(null);
  const [openKycModal, setOpenKycModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [loadingKyc, setLoadingKyc] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/caregivers`);
      setCaregivers(res.data);
    } catch (err) {
      console.error('Failed to fetch caregivers:', err);
      setFeedback({ open: true, message: 'Failed to fetch caregivers', severity: 'error' });
    }
  };

  const fetchKYCDetails = async (caregiverId) => {
    setLoadingKyc(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/admin/kyc/${caregiverId}`);
      
      // Handle both possible response structures
      const data = res.data.data || res.data;
      
      if (!data) {
        throw new Error('No data received');
      }
      
      setKycDetails({
        ...data,
        // Ensure all required fields exist
        caregiver_name: data.caregiver_name || 'N/A',
        home_address: data.home_address || 'N/A',
        // Add other fields with fallbacks
      });
      
    } catch (err) {
      console.error('KYC fetch error:', err);
      setFeedback({
        open: true,
        message: err.response?.data?.message || 'Failed to load KYC details',
        severity: 'error'
      });
      setKycDetails(null);
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleKycAction = async (action) => {
    if (action === 'rejected' && !adminNotes.trim()) {
      setFeedback({ open: true, message: 'Please provide rejection reason', severity: 'error' });
      return;
    }

    try {
      setLoadingKyc(true);
      const response = await axios.patch(
        `${BASE_URL}/api/admin/kyc/${selectedCaregiver.id}/status`,
        {
          status: action === 'approved' ? 'Approved' : 'Rejected',
          admin_notes: action === 'rejected' ? adminNotes : null
        },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            // 'Authorization': `Bearer ${yourAuthToken}`
          }
        }
      );

      if (response.data.success) {
        setFeedback({
          open: true,
          message: `KYC ${action} successfully`,
          severity: 'success'
        });
        setOpenKycModal(false);
        setAdminNotes('');
        fetchCaregivers(); // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to update KYC status');
      }
    } catch (error) {
      console.error('KYC action error:', error.response?.data || error.message);
      setFeedback({
        open: true,
        message: error.response?.data?.message || `Failed to ${action} KYC`,
        severity: 'error'
      });
    } finally {
      setLoadingKyc(false);
    }
  };

  const handleOpenKycModal = async (caregiver) => {
    setSelectedCaregiver(caregiver);
    setOpenKycModal(true);
    await fetchKYCDetails(caregiver.id);
  };

  const filteredCaregivers = caregivers.filter(
    (cg) =>
      cg.name?.toLowerCase().includes(search.toLowerCase()) ||
      cg.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (_, newPage) => setPage(newPage);

  const handleOpenModal = (cg) => {
    setSelectedCaregiver(cg);
    setNewStatus(cg.status || 'pending');
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCaregiver(null);
    setNewStatus('');
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  const handleUpdateStatus = async () => {
    try {
      await axios.post(`${BASE_URL}/api/admin/update-caregiver-status`, {
        caregiverId: selectedCaregiver.id,
        status: newStatus,
      });
      setFeedback({ open: true, message: 'Status updated successfully.', severity: 'success' });
      handleCloseModal();
      fetchCaregivers();
    } catch (error) {
      console.error(error);
      setFeedback({ open: true, message: 'Failed to update status.', severity: 'error' });
    }
  };

  const handleDeleteCaregiver = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/admin/delete-caregiver/${selectedCaregiver.id}`);
      setFeedback({ open: true, message: 'Caregiver deleted successfully.', severity: 'success' });
      handleCloseDeleteDialog();
      handleCloseModal();
      fetchCaregivers();
    } catch (error) {
      console.error(error);
      setFeedback({ open: true, message: 'Failed to delete caregiver.', severity: 'error' });
    }
  };

  const getButtonState = (status) => {
    switch(status) {
      case 'Approved':
        return { rejectDisabled: true, approveDisabled: true };
      case 'Rejected':
        return { rejectDisabled: false, approveDisabled: false };
      case 'Pending':
      default:
        return { rejectDisabled: false, approveDisabled: false };
    }
  };

  const { rejectDisabled, approveDisabled } = getButtonState(kycDetails?.status);


  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>
        Manage Helpers
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: <SearchIcon sx={{ color: 'gray' }} />,
          }}
        />
      </Box>

      <Paper sx={{ overflowX: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#648E87' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                {!isMobile && (
                  <>
                    <TableCell sx={{ color: 'white' }}>Email</TableCell>
                    <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                  </>
                )}
                <TableCell sx={{ color: 'white' }}>KYC Status</TableCell>
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCaregivers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((cg) => (
                  <TableRow key={cg.id}>
                    <TableCell>{cg.name}</TableCell>
                    {!isMobile && (
                      <>
                        <TableCell>{cg.email}</TableCell>
                        <TableCell>{cg.phone}</TableCell>
                      </>
                    )}
                    <TableCell>
                      <Button 
                        variant="outlined" 
                        size="small"
                        startIcon={<DescriptionIcon />}
                        onClick={() => handleOpenKycModal(cg)}
                        // disabled={!cg.kycStatus} // Disable if no KYC submitted
                      >
                        View KYC Details
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ color: 'blue', cursor: 'pointer' }} onClick={() => handleOpenModal(cg)}>
                        View Details
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredCaregivers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 2 : 4} align="center">
                    No caregivers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredCaregivers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </Paper>

      {/* Modal */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle>Caregiver Details</DialogTitle>
        <DialogContent dividers>
          {selectedCaregiver && (
            <>
              <Typography><strong>Name:</strong> {selectedCaregiver.name}</Typography>
              <Typography><strong>Email:</strong> {selectedCaregiver.email}</Typography>
              <Typography><strong>Phone:</strong> {selectedCaregiver.phone}</Typography>
              <Typography><strong>Gender:</strong> {selectedCaregiver.gender}</Typography>
              <Typography><strong>Status:</strong> {selectedCaregiver.status}</Typography>

              <Box mt={2}>
                <FormControl fullWidth>
                  <InputLabel>Update Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="Update Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<EditIcon />} color="primary" onClick={handleUpdateStatus}>
            Update Status
          </Button>
          <Button startIcon={<DeleteIcon />} color="error" onClick={handleOpenDeleteDialog}>
            Delete
          </Button>
          <Button onClick={handleCloseModal}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this caregiver? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
          <Button color="error" onClick={handleDeleteCaregiver}>
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* // Add KYC Modal */}
      <Dialog open={openKycModal} onClose={() => setOpenKycModal(false)} fullWidth maxWidth="md">
        <DialogTitle>
          KYC Verification - {kycDetails?.caregiver_name || 'Caregiver'}
          {loadingKyc && <CircularProgress size={24} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent dividers>
          {loadingKyc ? (
            <Box display="flex" justifyContent="center" p={4}>
              <CircularProgress />
            </Box>
          ) : kycDetails ? (
            <>
              <Box mb={3}>
                <Typography variant="h6">Personal Information</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Full Name:</strong> {kycDetails.caregiver_name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Email:</strong> {kycDetails.caregiver_email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Phone:</strong> {kycDetails.caregiver_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>NIN:</strong> {kycDetails.nin}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography><strong>Home Address:</strong> {kycDetails.home_address}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Box mb={3}>
                <Typography variant="h6">Documents</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">ID Card</Typography>
                    <img 
                      src={`${BASE_URL}/uploads/kyc/${kycDetails.id_card_path}`}
                      alt="ID Card"
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2">Proof of Address</Typography>
                    <img 
                      src={`${BASE_URL}/uploads/kyc/${kycDetails.proof_of_address_path}`}
                      alt="Proof of Address"
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box mb={3}>
                <Typography variant="h6">Guarantor 1</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Name:</strong> {kycDetails.guarantor1_name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Phone:</strong> {kycDetails.guarantor1_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Email:</strong> {kycDetails.guarantor1_email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Relationship:</strong> {kycDetails.guarantor1_relationship}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Guarantor Document</Typography>
                    <img 
                      src={`${BASE_URL}/uploads/kyc/${kycDetails.guarantor1_document_path}`}
                      alt="Guarantor 1 Document"
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <Box mb={3}>
                <Typography variant="h6">Guarantor 2</Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Name:</strong> {kycDetails.guarantor2_name}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Phone:</strong> {kycDetails.guarantor2_phone}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Email:</strong> {kycDetails.guarantor2_email}</Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography><strong>Relationship:</strong> {kycDetails.guarantor2_relationship}</Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">Guarantor Document</Typography>
                    <img 
                      src={`${BASE_URL}/uploads/kyc/${kycDetails.guarantor2_document_path}`}
                      alt="Guarantor 2 Document"
                      style={{ maxWidth: '100%', maxHeight: '200px', marginTop: '8px' }}
                    />
                  </Grid>
                </Grid>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Admin Notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                sx={{ mt: 2 }}
                disabled={kycDetails?.status === 'Approved'}
                InputProps={{
                  readOnly: kycDetails?.status === 'Approved',
                }}
                helperText={kycDetails?.status === 'Approved' ? "Notes cannot be edited after approval" : ""}
              />
            </>
          ) : (
            <Typography>No KYC details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            color="error"
            onClick={() => handleKycAction('rejected')}
            disabled={loadingKyc || rejectDisabled}
            startIcon={<Cancel />}
          >
            Reject
          </Button>

          <Button 
            color="success"
            onClick={() => handleKycAction('approved')}
            disabled={loadingKyc || approveDisabled}
            startIcon={<CheckCircle />}
          >
            Approve
          </Button>
          <Button onClick={() => setOpenKycModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={feedback.open}
        autoHideDuration={4000}
        onClose={() => setFeedback({ ...feedback, open: false })}
      >
        <Alert onClose={() => setFeedback({ ...feedback, open: false })} severity={feedback.severity}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ManageCaregivers;
