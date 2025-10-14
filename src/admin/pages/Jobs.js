import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  Grid,
  Button,
  Stack,
} from "@mui/material";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const ITEMS_PER_PAGE = 5;

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/admin/get-jobs`);
        const data = response.data.data || [];
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = jobs.filter((job) =>
    (job.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (job.posted_by?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (job.location?.toLowerCase() || "").includes(searchQuery.toLowerCase())
    );


  const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);
  const displayedJobs = filteredJobs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );

  return (
    <Box p={4}>
      <Typography variant="h4" mb={3}>
        All Jobs & Applicants
      </Typography>

      <TextField
        label="Search Jobs"
        variant="outlined"
        fullWidth
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setCurrentPage(1); // Reset to first page on search
        }}
        sx={{ mb: 3 }}
      />

      <Stack spacing={3}>
        {displayedJobs.length === 0 && (
          <Typography color="textSecondary">No jobs found.</Typography>
        )}

        {displayedJobs.map((job) => (
          <Card key={job.job_id} variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {job.title} - {job.location}
              </Typography>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Posted by {job.posted_by} ({job.user_email}) | Status: {job.status || "active"} |{" "}
                {new Date(job.created_at).toLocaleString()}
              </Typography>

              {job.applicants.length > 0 ? (
                <Grid container spacing={2} mt={1}>
                  {job.applicants.map((app) => (
                    <Grid item xs={12} md={6} key={app.application_id}>
                      <Card variant="outlined">
                        <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                          <Avatar
                            src={
                              app.caregiver_profile_image
                                ? `${BASE_URL}/uploads/caregivers/${app.caregiver_profile_image}`
                                : undefined
                            }
                            alt={app.caregiver_name}
                            sx={{ width: 56, height: 56 }}
                          />
                          <Box>
                            <Typography fontWeight="bold">{app.caregiver_name}</Typography>
                            <Typography variant="body2" color="textSecondary">
                              {app.caregiver_email} | {app.caregiver_phone}
                            </Typography>
                            <Typography
                              variant="body2"
                              color={
                                app.application_status === "approved"
                                  ? "green"
                                  : app.application_status === "rejected"
                                  ? "red"
                                  : "orange"
                              }
                            >
                              Status: {app.application_status || "pending"}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography color="textSecondary" mt={1}>
                  No applicants yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={2} gap={2}>
            <Button
              variant="contained"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Typography alignSelf="center">
              Page {currentPage} of {totalPages}
            </Typography>
            <Button
              variant="contained"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
