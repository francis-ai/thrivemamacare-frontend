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
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;
const planOptions = ['All-Inclusive Bundle', 'One-Time Access'];

const ManageUsers = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;
  const [users, setUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openDetailsModal, setOpenDetailsModal] = useState(false);
  const [openSubscriptionModal, setOpenSubscriptionModal] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [subscriptionForm, setSubscriptionForm] = useState({
    is_premium: 0,
    current_plan: '',
    plan_expires_at: '',
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/users`);
        setUsers(res.data.users || res.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (_, newPage) => setPage(newPage);

  /** --- View Details Modal --- */
  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setOpenDetailsModal(true);
  };
  const handleCloseDetails = () => {
    setSelectedUser(null);
    setOpenDetailsModal(false);
  };

  /** --- Delete User --- */
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await axios.delete(`${BASE_URL}/api/admin/delete-user/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setOpenConfirmDialog(false);
      setUserToDelete(null);
      if (selectedUser?.id === userToDelete.id) setOpenDetailsModal(false);
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('Failed to delete user.');
    }
  };

  /** --- Subscription Modal --- */
  const handleOpenSubscriptionForm = (user) => {
    setSelectedUser(user);
    setSubscriptionForm({
      is_premium: user.is_premium || 0,
      current_plan: user.current_plan || '',
      plan_expires_at: user.plan_expires_at || '',
    });
    setOpenSubscriptionModal(true);
  };

  const handleSubscriptionChange = (field, value) => {
    setSubscriptionForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpdateSubscription = async () => {
    try {
      await axios.put(
        `${BASE_URL}/api/admin/user/subscription-status/${selectedUser.id}`,
        subscriptionForm
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === selectedUser.id ? { ...u, ...subscriptionForm } : u))
      );
      setOpenSubscriptionModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to update subscription:', err);
      alert('Failed to update subscription.');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" mb={2}>Manage Users</Typography>

      {/* Search */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ endAdornment: <SearchIcon sx={{ color: 'gray' }} /> }}
        />
      </Box>

      {/* Users Table */}
      <Paper sx={{ overflowX: 'hidden' }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#648E87' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Name</TableCell>
                {!isMobile && <>
                  <TableCell sx={{ color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ color: 'white' }}>Phone</TableCell>
                </>}
                <TableCell sx={{ color: 'white' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    {!isMobile && <>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                    </>}
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenDetails(user)}
                        sx={{ mr: 1, textTransform: 'none' }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => { setUserToDelete(user); setOpenConfirmDialog(true); }}
                        sx={{ mr: 1, textTransform: 'none' }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleOpenSubscriptionForm(user)}
                        sx={{ textTransform: 'none' }}
                      >
                        {user.is_premium ? 'Premium' : 'Standard'} - {user.current_plan || '-'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={isMobile ? 3 : 4} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]}
        />
      </Paper>

      {/* Details Modal */}
      <Dialog open={openDetailsModal} onClose={handleCloseDetails} fullWidth maxWidth="sm">
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <>
              <Typography><strong>Name:</strong> {selectedUser.name}</Typography>
              <Typography><strong>Email:</strong> {selectedUser.email}</Typography>
              <Typography><strong>Phone:</strong> {selectedUser.phone}</Typography>
              <Typography><strong>Gender:</strong> {selectedUser.gender}</Typography>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Modal */}
      <Dialog open={openSubscriptionModal} onClose={() => setOpenSubscriptionModal(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Subscription</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <>
              <FormControlLabel
                control={
                  <Switch
                    checked={!!subscriptionForm.is_premium}
                    onChange={(e) => handleSubscriptionChange('is_premium', e.target.checked ? 1 : 0)}
                    color="success"
                  />
                }
                label="Premium User"
              />
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Current Plan</InputLabel>
                  <Select
                    value={subscriptionForm.current_plan}
                    label="Current Plan"
                    onChange={(e) => handleSubscriptionChange('current_plan', e.target.value)}
                  >
                    {planOptions.map((plan) => (
                      <MenuItem key={plan} value={plan}>{plan}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box sx={{ mt: 2 }}>
                <TextField
                  type="date"
                  label="Plan Expire At"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={subscriptionForm.plan_expires_at}
                  onChange={(e) => handleSubscriptionChange('plan_expires_at', e.target.value)}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSubscriptionModal(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateSubscription}>Update</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent dividers>
          <Typography>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManageUsers;
