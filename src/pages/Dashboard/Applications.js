import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Alert,
  Snackbar,
  Alert as MuiAlert,
  Dialog,
  DialogTitle,
  DialogContent,
  Avatar,
  Grid,
} from "@mui/material";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";
// const hoverColor = "#557870";

export default function JobApplicants() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Caregiver view dialog
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleOpenDialog = async (caregiverId) => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/caregiver/${caregiverId}`);
      setSelectedCaregiver(res.data.data);
      setOpenDialog(true);
    } catch (err) {
      console.error("Failed to fetch caregiver details:", err);
    }
  };

  const handleCloseDialog = () => setOpenDialog(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  // Fetch applicants
  const fetchApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/users/applicants/${user.id}`);
      setApplications(res.data.data || []);
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: "Failed to load applicants.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Update application status (approve/reject)
  const handleStatusChange = async (applicationId, status) => {
    try {
      await axios.patch(`${BASE_URL}/api/users/applicants/update-status/${applicationId}`, { status });
      setSnackbar({
        open: true,
        message: `Applicant ${status} successfully!`,
        severity: "success",
      });
      fetchApplications();
    } catch (err) {
      console.error(err);
      setSnackbar({
        open: true,
        message: `Failed to update applicant status.`,
        severity: "error",
      });
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter(
      (app) =>
        app.caregiver_name.toLowerCase().includes(search.toLowerCase()) ||
        app.job_title.toLowerCase().includes(search.toLowerCase())
    );
  }, [applications, search]);

  if (loading) return <Alert severity="info">Loading applicants...</Alert>;

  return (
    <DashboardLayout>
      <Box className="container-fluid py-4">
        <Typography variant="h4" sx={{ color: primaryColor, mb: 3 }}>
          Applicants for Your Jobs
        </Typography>

        <TextField
          placeholder="Search by caregiver or job..."
          variant="outlined"
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        {filteredApplications.length === 0 ? (
          <Alert severity="info">No applicants found.</Alert>
        ) : (
          <TableContainer component={Paper} className="shadow-sm">
            <Table>
              <TableHead sx={{ backgroundColor: `${primaryColor}08` }}>
                <TableRow>
                  <TableCell>Caregiver Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Job Title</TableCell>
                  <TableCell>View</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApplications.map((app) => (
                  <TableRow key={app.application_id} hover>
                    <TableCell>{app.caregiver_name}</TableCell>
                    <TableCell>{app.caregiver_email}</TableCell>
                    <TableCell>{app.job_title}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        variant="text"
                        onClick={() => handleOpenDialog(app.caregiver_id)}
                        sx={{ color: primaryColor, textTransform: "capitalize" }}
                      >
                        View
                      </Button>
                    </TableCell>
                    <TableCell>
                      <span style={{ textTransform: "capitalize", fontWeight: 500 }}>
                        {app.application_status || "pending"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(app.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: "#1B873E",
                          color: "#1B873E",
                          mr: 1,
                          "&:hover": { borderColor: "#146c2f", backgroundColor: "rgba(27,135,62,0.05)" },
                        }}
                        onClick={() => handleStatusChange(app.application_id, "approved")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        sx={{
                          borderColor: "#B3261E",
                          color: "#B3261E",
                          "&:hover": { borderColor: "#9f1c16", backgroundColor: "rgba(179,38,30,0.05)" },
                        }}
                        onClick={() => handleStatusChange(app.application_id, "rejected")}
                      >
                        Reject
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog: View Caregiver */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: primaryColor }}>Caregiver Details</DialogTitle>
        <DialogContent>
          {selectedCaregiver ? (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={`${BASE_URL}/uploads/caregivers/${selectedCaregiver?.profile_image || ""}`}
                  alt={selectedCaregiver.name}
                  sx={{ width: 64, height: 64, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6">{selectedCaregiver.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedCaregiver.email}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography><b>Phone:</b> {selectedCaregiver.phone}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><b>Gender:</b> {selectedCaregiver.gender}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography><b>Address:</b> {selectedCaregiver.address}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><b>Status:</b> {selectedCaregiver.status}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Joined: {new Date(selectedCaregiver.created_at).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          ) : (
            <Typography>Loading caregiver details...</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </DashboardLayout>
  );
}
