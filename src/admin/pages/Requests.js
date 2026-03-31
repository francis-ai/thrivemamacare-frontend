import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  TablePagination,
  Chip,
} from '@mui/material';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_BASE_URL;

const parsePreferences = (value) => {
  if (!value) return {};
  if (typeof value === 'object') return value;

  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
};

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/admin/all-caregiver-requests`);
        setRequests(res.data.requests || []);
      } catch (error) {
        console.error('Failed to fetch caregiver requests:', error);
      }
    };

    fetchRequests();
  }, []);

  const handleSearchChange = (e) => setSearch(e.target.value.toLowerCase());

  const filteredRequests = requests.filter(
    (req) =>
      req?.name?.toLowerCase().includes(search) ||
      (req?.service || req?.primary_role || '').toLowerCase().includes(search) ||
      req?.status?.toLowerCase().includes(search)
  );

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const statusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'warning';
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Helper Requests
      </Typography>

      <TextField
        label="Search by name, type or status"
        variant="outlined"
        fullWidth
        margin="normal"
        onChange={handleSearchChange}
      />

      <Paper elevation={2}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#648E87' }}>
                <TableCell sx={{ color: '#fff' }}>#</TableCell>
                <TableCell sx={{ color: '#fff' }}>User</TableCell>
                <TableCell sx={{ color: '#fff' }}>Service Type</TableCell>
                <TableCell sx={{ color: '#fff' }}>Primary Role</TableCell>
                <TableCell sx={{ color: '#fff' }}>Duration</TableCell>
                <TableCell sx={{ color: '#fff' }}>Location</TableCell>
                <TableCell sx={{ color: '#fff' }}>Preferences</TableCell>
                <TableCell sx={{ color: '#fff' }}>Offer Amount</TableCell>
                <TableCell sx={{ color: '#fff' }}>Matches</TableCell>
                <TableCell sx={{ color: '#fff' }}>Status</TableCell>
                <TableCell sx={{ color: '#fff' }}>Submitted On</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    No caregiver requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((req, index) => {
                    const preferences = parsePreferences(req.preferences);
                    return (
                    <TableRow key={req.id}>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{req.name || 'N/A'}</TableCell>
                      <TableCell>{req.service || 'N/A'}</TableCell>
                      <TableCell>{req.primary_role || 'N/A'}</TableCell>
                      <TableCell>{req.duration || 'N/A'}</TableCell>
                      <TableCell>{req.state || req.address || 'N/A'}</TableCell>
                      <TableCell>
                        {preferences.ethnicity && preferences.ethnicity !== 'Any' ? preferences.ethnicity : '-'}
                        {' / '}
                        {preferences.religion && preferences.religion !== 'Any' ? preferences.religion : '-'}
                      </TableCell>
                      <TableCell>{req.offer_amount || 'N/A'}</TableCell>
                      <TableCell>
                        {Number(req.accepted_matches || 0)} / {Number(req.total_matches || 0)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={req.status || 'Unknown'}
                          color={statusColor(req.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {req.created_at
                          ? new Date(req.created_at).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  )})
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredRequests.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default Requests;
