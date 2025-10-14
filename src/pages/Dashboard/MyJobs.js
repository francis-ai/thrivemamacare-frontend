import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TablePagination,
  Modal,
  Fade,
  Grid,
  Paper,
  Alert,
} from "@mui/material";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuthUser } from "../../context/AuthContextUser";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";
const hoverColor = "#557870";

const styles = {
  primaryButton: {
    backgroundColor: primaryColor,
    "&:hover": { backgroundColor: hoverColor },
  },
  outlinedButton: {
    borderColor: primaryColor,
    color: primaryColor,
    "&:hover": {
      borderColor: hoverColor,
      backgroundColor: "rgba(100, 142, 135, 0.04)",
    },
  },
};

export default function MyJobsPage() {
  const { user } = useAuthUser();
  const userId = user?.id;

  const [jobs, setJobs] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/users/jobs/${userId}`);
      setJobs(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) fetchJobs();
  }, [userId, fetchJobs]);

  const handleViewJob = (job) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getDaysAgo = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "closed":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout>
      <div className="container-fluid py-4">
        <div className="mb-5">
          <h1 className="h2 fw-bold mb-3" style={{ color: primaryColor }}>
            Job Submission Tracker
          </h1>
          <p className="text-muted fs-5">
            Monitor and manage all your job postings in one place
          </p>
        </div>

        <Card className="shadow-lg border-0 mb-4 p-2">
          <div className="card-header bg-transparent py-3 border-bottom">
            <h5 className="card-title mb-0 fw-bold">Job Management</h5>
          </div>
          <div className="card-body">
            <JobTableView
              jobs={jobs}
              handleViewJob={handleViewJob}
              page={page}
              rowsPerPage={rowsPerPage}
              totalJobs={jobs.length}
              handleChangePage={handleChangePage}
              handleChangeRowsPerPage={handleChangeRowsPerPage}
              getStatusColor={getStatusColor}
              getDaysAgo={getDaysAgo}
            />
          </div>
        </Card>

        <JobDetailsModal
          showJobDetails={showJobDetails}
          setShowJobDetails={setShowJobDetails}
          selectedJob={selectedJob}
          primaryColor={primaryColor}
          getDaysAgo={getDaysAgo}
          getStatusColor={getStatusColor}
        />
      </div>
    </DashboardLayout>
  );
}

function JobTableView({
  jobs,
  handleViewJob,
  page,
  rowsPerPage,
  totalJobs,
  handleChangePage,
  handleChangeRowsPerPage,
  getStatusColor,
  getDaysAgo,
}) {
  const paginatedJobs = jobs.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      {/* Mobile cards */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {jobs.length === 0 ? (
          <Alert severity="info" className="rounded-3">
            No jobs found.
          </Alert>
        ) : (
          paginatedJobs.map((job) => (
            <Card key={job.id} className="shadow-sm border-0 mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <h6 className="fw-bold mb-0">{job.job_title}</h6>
                  <Chip label={job.status} color={getStatusColor(job.status)} size="small" />
                </div>
                <p className="text-muted small mb-2">
                  {job.company_name} • {job.location}
                </p>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">{getDaysAgo(job.created_at)}</span>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={styles.outlinedButton}
                    onClick={() => handleViewJob(job)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </Box>

      {/* Desktop table */}
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        {jobs.length === 0 ? (
          <Alert severity="info" className="m-3 rounded-3">
            No jobs found.
          </Alert>
        ) : (
          <>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: `${primaryColor}08` }}>
                  <TableCell className="fw-semibold">Job Title</TableCell>
                  <TableCell className="fw-semibold">Company</TableCell>
                  <TableCell className="fw-semibold">Location</TableCell>
                  <TableCell className="fw-semibold">Type</TableCell>
                  <TableCell className="fw-semibold">Status</TableCell>
                  <TableCell className="fw-semibold">Posted</TableCell>
                  <TableCell className="fw-semibold text-center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedJobs.map((job) => (
                  <TableRow key={job.id} sx={{ "&:hover": { backgroundColor: "rgba(100,142,135,0.03)" } }}>
                    <TableCell>{job.job_title}</TableCell>
                    <TableCell>{job.company_name}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>
                      <span className="badge bg-light text-dark rounded-pill px-2">{job.job_type}</span>
                    </TableCell>
                    <TableCell>
                      <Chip label={job.status} color={getStatusColor(job.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      <div className="small">
                        {new Date(job.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-muted">{getDaysAgo(job.created_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outlined"
                        size="small"
                        sx={styles.outlinedButton}
                        onClick={() => handleViewJob(job)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalJobs}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </TableContainer>
    </>
  );
}

function JobDetailsModal({ showJobDetails, setShowJobDetails, selectedJob, primaryColor, getStatusColor, getDaysAgo }) {
  if (!selectedJob) return null;

  return (
    <Modal
      open={showJobDetails}
      onClose={() => setShowJobDetails(false)}
      closeAfterTransition
      sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 2 }}
    >
      <Fade in={showJobDetails}>
        <Box
          sx={{
            backgroundColor: "white",
            maxWidth: "800px",
            width: "100%",
            borderRadius: 3,
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          <div className="p-4">
            <div className="d-flex justify-content-between align-items-start mb-4">
              <div>
                <h4 className="fw-bold mb-2" style={{ color: primaryColor }}>
                  {selectedJob.job_title}
                </h4>
                <p className="text-muted fs-5 mb-2">
                  {selectedJob.company_name} • {selectedJob.location}
                </p>
                <div className="d-flex gap-2 flex-wrap">
                  <Chip label={selectedJob.status} color={getStatusColor(selectedJob.status)} size="medium" />
                  <span className="badge bg-light text-dark px-3 py-2 rounded-pill">{selectedJob.job_type}</span>
                  <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    Posted {getDaysAgo(selectedJob.created_at)}
                  </span>
                </div>
              </div>
              <Button onClick={() => setShowJobDetails(false)} sx={{ color: primaryColor, fontSize: 18 }}>
                ✕
              </Button>
            </div>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper className="p-3 border-0 bg-light bg-opacity-10">
                  <h6 className="fw-semibold mb-3" style={{ color: primaryColor }}>
                    Job Information
                  </h6>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Experience:</strong>
                      <div className="text-muted">{selectedJob.experience || "Not specified"}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Qualification:</strong>
                      <div className="text-muted">{selectedJob.qualification || "Not specified"}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Gender:</strong>
                      <div className="text-muted">{selectedJob.gender || "Any"}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Type:</strong>
                      <div className="text-muted">{selectedJob.type || "Not specified"}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Salary Range:</strong>
                      <div className="text-muted">{selectedJob.salary_range || "Not specified"}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Deadline:</strong>
                      <div className="text-muted">
                        {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : "Not specified"}
                      </div>
                    </div>
                  </div>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper className="p-3 border-0 bg-light bg-opacity-10">
                  <h6 className="fw-semibold mb-3" style={{ color: primaryColor }}>
                    Submission Details
                  </h6>
                  <div className="row">
                    <div className="col-6 mb-2">
                      <strong>Posted On:</strong>
                      <div className="text-muted">{new Date(selectedJob.created_at).toLocaleDateString()}</div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Last Updated:</strong>
                      <div className="text-muted">
                        {selectedJob.updated_at ? new Date(selectedJob.updated_at).toLocaleDateString() : "Never"}
                      </div>
                    </div>
                    <div className="col-6 mb-2">
                      <strong>Contact Phone:</strong>
                      <div className="text-muted">{selectedJob.contact_phone || "Not specified"}</div>
                    </div>
                  </div>
                </Paper>
              </Grid>

              {selectedJob.description && (
                <Grid item xs={12}>
                  <Paper className="p-3 border-0 bg-light bg-opacity-10">
                    <h6 className="fw-semibold mb-2" style={{ color: primaryColor }}>
                      Job Description
                    </h6>
                    <p className="text-muted mb-0">{selectedJob.description}</p>
                  </Paper>
                </Grid>
              )}

              {selectedJob.responsibilities && (
                <Grid item xs={12} md={6}>
                  <Paper className="p-3 border-0 bg-light bg-opacity-10">
                    <h6 className="fw-semibold mb-2" style={{ color: primaryColor }}>
                      Responsibilities
                    </h6>
                    <p className="text-muted mb-0">{selectedJob.responsibilities}</p>
                  </Paper>
                </Grid>
              )}

              {selectedJob.requirements && (
                <Grid item xs={12} md={6}>
                  <Paper className="p-3 border-0 bg-light bg-opacity-10">
                    <h6 className="fw-semibold mb-2" style={{ color: primaryColor }}>
                      Requirements
                    </h6>
                    <p className="text-muted mb-0">{selectedJob.requirements}</p>
                  </Paper>
                </Grid>
              )}
            </Grid>

            <div className="mt-4 pt-3 border-top text-end">
              <Button variant="outlined" onClick={() => setShowJobDetails(false)} sx={styles.outlinedButton}>
                Close
              </Button>
            </div>
          </div>
        </Box>
      </Fade>
    </Modal>
  );
}
