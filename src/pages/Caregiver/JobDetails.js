import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  Divider,
  Alert,
  Stack,
  Skeleton,
  Breadcrumbs,
  Link,
  Snackbar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  LocationOn,
  Business,
  Work,
  Security,
  Phone,
  School,
  AccessTime,
  Person,
  Event,
} from "@mui/icons-material";
import DashboardLayout from "../../components/Caregiver/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";
const hoverColor = "#557870";

export default function JobDetailsCaregiver() {
  const { id } = useParams();
  const { caregiver } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "info" });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/caregivers/all-jobs/${id}`)
      .then((res) => setJob(res.data.data))
      .catch(() =>
        setSnack({
          open: true,
          message: "Failed to load job details.",
          severity: "error",
        })
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handleApply = async () => {
    if (!caregiver?.id)
      return setSnack({
        open: true,
        message: "Login as caregiver to apply.",
        severity: "warning",
      });

    setApplying(true);
    try {
      await axios.post(`${BASE_URL}/api/caregivers/apply`, {
        jobId: id,
        caregiverId: caregiver.id,
      });
      setSnack({
        open: true,
        message: "Interest submitted successfully!",
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: err.response?.data?.message || "Failed to apply.",
        severity: "error",
      });
    } finally {
      setApplying(false);
    }
  };

  const InfoItem = ({ icon: Icon, label, value }) => (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        wordBreak: "break-word",
        flexWrap: "wrap",
        mb: 0.6,
      }}
    >
      <Icon sx={{ fontSize: 18, color: primaryColor }} />
      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
        <strong>{label}:</strong> {value || "N/A"}
      </Typography>
    </Stack>
  );

  if (loading)
    return (
      <DashboardLayout>
        <Box p={4}>
          <Skeleton variant="rectangular" width="100%" height={400} />
        </Box>
      </DashboardLayout>
    );

  if (!job) return <Alert severity="error">Job not found!</Alert>;

  return (
    <DashboardLayout>
      <Box
        p={{ xs: 2, md: 4 }}
        sx={{
          overflowX: "hidden",
          width: "100%",
          maxWidth: "100vw",
        }}
      >
        <Breadcrumbs sx={{ mb: 3, fontSize: 14 }}>
          <Link color="inherit" href="/caregiver/dashboard">
            Dashboard
          </Link>
          <Link color="inherit" href="/caregiver/jobs">
            Available Jobs
          </Link>
          <Typography color="text.primary">Job Details</Typography>
        </Breadcrumbs>

        <Grid
          container
          spacing={3}
          direction={isMobile ? "column" : "row"}
          sx={{ width: "100%", margin: 0 }}
        >
          {/* LEFT SECTION */}
          <Grid item xs={12} md={8.5}>
            <Paper
              sx={{
                p: { xs: 2, md: 3 },
                borderRadius: 3,
                boxShadow: 3,
                width: "100%",
                overflowX: "auto",
              }}
            >
              {/* Job Header */}
              <Typography
                variant="h4"
                fontWeight={700}
                mb={1}
                sx={{ color: primaryColor, fontSize: isMobile ? 22 : 28 }}
              >
                {job.job_title}
              </Typography>

              <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                mb={2}
                sx={{ flexWrap: "wrap" }}
              >
                <InfoItem icon={Business} label="Company" value={job.company_name} />
                <InfoItem icon={LocationOn} label="Location" value={job.location} />
              </Stack>

              <Stack direction="row" spacing={1} mb={3} flexWrap="wrap">
                <Chip icon={<Work />} label={job.job_type} variant="outlined" color="primary" />
                <Chip label={job.status || "Active"} color="success" />
                <Chip
                  label={`Posted on ${new Date(job.created_at).toLocaleDateString()}`}
                  color="info"
                  variant="outlined"
                />
              </Stack>

              <Divider sx={{ mb: 3 }} />

              {/* Job Information */}
              <Typography
                variant="h6"
                fontWeight={600}
                mb={2}
                sx={{ color: primaryColor }}
              >
                Job Information
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={AccessTime} label="Experience" value={job.experience} />
                  <InfoItem icon={Person} label="Gender" value={job.gender} />
                  <InfoItem icon={Phone} label="Contact Phone" value={job.contact_phone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoItem icon={School} label="Qualification" value={job.qualification} />
                  <InfoItem icon={Work} label="Type" value={job.type} />
                  <InfoItem
                    icon={Event}
                    label="Deadline"
                    value={
                      job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "N/A"
                    }
                  />
                </Grid>
              </Grid>

              {/* Salary */}
              <Box mt={3}>
                <Typography
                  variant="h6"
                  fontWeight={600}
                  mb={1}
                  sx={{ color: primaryColor }}
                >
                  Salary Range
                </Typography>
                <Typography variant="body2" sx={{ fontSize: 15 }}>
                  ₦({job.salary_range || "Negotiable"})
                </Typography>
              </Box>

              {/* Description */}
              {job.description && (
                <Box mt={3}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={1}
                    sx={{ color: primaryColor }}
                  >
                    Job Description
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
                  >
                    {job.description}
                  </Typography>
                </Box>
              )}

              {/* Responsibilities */}
              {job.responsibilities && (
                <Box mt={3}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={1}
                    sx={{ color: primaryColor }}
                  >
                    Responsibilities
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
                  >
                    {job.responsibilities}
                  </Typography>
                </Box>
              )}

              {/* Requirements */}
              {job.requirements && (
                <Box mt={3}>
                  <Typography
                    variant="h6"
                    fontWeight={600}
                    mb={1}
                    sx={{ color: primaryColor }}
                  >
                    Requirements
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}
                  >
                    {job.requirements}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* RIGHT SECTION */}
          <Grid item xs={12} md={3.5}>
            <Box sx={{ position: { md: "sticky" }, top: { md: 100 } }}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: 3,
                  width: "100%",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={primaryColor}
                  mb={1}
                >
                  ₦({job.salary_range || "Negotiable"})
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mb={2}
                >
                  Apply before{" "}
                  <b>
                    {job.deadline
                      ? new Date(job.deadline).toLocaleDateString()
                      : "N/A"}
                  </b>
                </Typography>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundColor: primaryColor,
                    "&:hover": { backgroundColor: hoverColor },
                    mb: 2,
                    borderRadius: 2,
                    py: 1.2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                  onClick={handleApply}
                  disabled={applying}
                >
                  {applying ? "Applying..." : "Apply Now"}
                </Button>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" mb={1}>
                  Posted by: <b>{job.posted_by || job.company_name}</b>
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={1}
                >
                  <Security sx={{ color: "warning.main" }} />
                  <Typography variant="caption" color="text.secondary">
                    Always verify job details before applying.
                  </Typography>
                </Stack>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </DashboardLayout>
  );
}
