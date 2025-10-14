import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  Chip,
  TextField,
  TablePagination,
} from "@mui/material";
import DashboardLayout from "../../components/Caregiver/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";
const hoverColor = "#557870";

export default function JobsForCaregivers() {
  const { caregiver } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(6);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/all-jobs`);
        setJobs(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.job_title.toLowerCase().includes(search.toLowerCase()) ||
        job.company_name.toLowerCase().includes(search.toLowerCase()) ||
        job.location.toLowerCase().includes(search.toLowerCase())
    );
  }, [jobs, search]);

  console.log(caregiver);
  const paginatedJobs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredJobs.slice(start, start + rowsPerPage);
  }, [filteredJobs, page, rowsPerPage]);

  const getDaysAgo = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  };

  return (
    <DashboardLayout>
      <Box className="container-fluid py-4">
        <Typography variant="h4" sx={{ color: primaryColor, mb: 3, fontWeight: 600 }}>
          Available Job Vacancies
        </Typography>

        <TextField
          placeholder="Search for job title, company or location..."
          variant="outlined"
          fullWidth
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 3 }}
        />

        {loading ? (
          <Alert severity="info">Loading jobs...</Alert>
        ) : filteredJobs.length === 0 ? (
          <Alert severity="info">No jobs found.</Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedJobs.map((job) => (
                <Grid item xs={12} md={6} key={job.id}>
                  <Card
                    className="shadow-sm border-0"
                    sx={{
                      transition: "0.3s",
                      "&:hover": { boxShadow: 6, transform: "translateY(-4px)" },
                    }}
                  >
                    <CardContent>
                      <Box className="d-flex justify-content-between align-items-center mb-2">
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {job.job_title}
                        </Typography>
                        <Chip label={job.status} color="success" size="small" />
                      </Box>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        {job.company_name} • {job.location}
                      </Typography>

                      <Typography variant="body2" color="text.secondary" mb={1}>
                        Posted by: {job.posted_by} • {getDaysAgo(job.created_at)}
                      </Typography>

                      <Box className="d-flex gap-2 mt-2">
                        <Button
                          variant="contained"
                          sx={{
                            backgroundColor: primaryColor,
                            "&:hover": { backgroundColor: hoverColor },
                            textTransform: "none",
                          }}
                          onClick={() => navigate(`/caregiver/jobs/${job.id}`)}
                        >
                          View Details
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={3}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={filteredJobs.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
              />
            </Box>
          </>
        )}

        <Box mt={4} textAlign="center">
          <Button
            variant="text"
            sx={{
              color: primaryColor,
              textDecoration: "underline",
              fontWeight: 500,
            }}
            onClick={() => navigate("/caregiver/my-applications")}
          >
            View My Applications →
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
