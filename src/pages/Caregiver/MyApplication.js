import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Button,
} from "@mui/material";
import DashboardLayout from "../../components/Caregiver/DashboardLayout";
import { useAuth } from "../../context/AuthContext";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const primaryColor = "#648E87";

export default function MyApplications() {
  const { caregiver } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/caregivers/applications/${caregiver.id}`);
        setApplications(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [caregiver.id]);

  return (
    <DashboardLayout>
      <Box className="container-fluid py-4">
        <Typography variant="h4" sx={{ color: primaryColor, mb: 3, fontWeight: 600 }}>
          My Job Applications
        </Typography>

        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
            <CircularProgress sx={{ color: primaryColor }} />
          </Box>
        ) : applications.length === 0 ? (
          <Alert severity="info">You haven’t applied for any job yet.</Alert>
        ) : (
          <Box>
            {applications.map((app) => (
              <Card key={app.application_id} sx={{ mb: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {app.job_title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Caregiver: {app.caregiver_name} ({app.caregiver_email})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: <strong>{app.application_status}</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applied On: {new Date(app.created_at).toLocaleDateString()}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        <Box mt={3} textAlign="center">
          <Button
            variant="outlined"
            sx={{
              borderColor: primaryColor,
              color: primaryColor,
              textTransform: "none",
              "&:hover": {
                borderColor: primaryColor,
                backgroundColor: "rgba(100,142,135,0.04)",
              },
            }}
            href="/caregiver/jobs"
          >
            ← Back to Job Listings
          </Button>
        </Box>
      </Box>
    </DashboardLayout>
  );
}
