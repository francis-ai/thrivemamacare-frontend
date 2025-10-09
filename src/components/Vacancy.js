// src/pages/UserVacancies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
} from "@mui/material";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UserVacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0); // 0: Caregiver, 1: User

  useEffect(() => {
    fetchVacancies();
  }, []);

  const fetchVacancies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/api/admin/vacancy`);
      setVacancies(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const caregiverVacancies = vacancies.filter(v => v.category === "caregiver");
  const userVacancies = vacancies.filter(v => v.category === "user");

  const renderCaregiverCard = (v) => (
    <Card key={v.id} sx={{ display: "flex", alignItems: "center", justifyContent: "center", p: 1, mb: 1, width: 320 }}>
      {v.caregiver_image && (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, borderRadius: "50%", mr: 1 }}
          image={`${BASE_URL}/${v.caregiver_image}`}
          alt={v.caregiver_name}
        />
      )}
      <CardContent sx={{ textAlign: "center" }}>
        <Typography variant="h6">{v.caregiver_name}</Typography>
        <Typography>{v.caregiver_address}</Typography>
        <Typography>{v.job_offer}</Typography>
        <Typography>{v.caregiver_bio}</Typography>
        <Typography>₦{v.caregiver_rate}</Typography>
        <Button
          variant="contained"
          sx={{
            mt: 1,
            bgcolor: "#648E87",
            "&:hover": { bgcolor: "#4e6e6b" },
            textTransform: "none",
          }}
        >
          Book Now
        </Button>
      </CardContent>
    </Card>
  );

  const renderUserCard = (v) => (
    <Card key={v.id} sx={{ p: 2, mb: 2, textAlign: "center" }}>
      <CardContent>
        <Typography variant="h6">Job Description</Typography>
        <Typography>{v.user_job_description}</Typography>
        <Typography>{v.user_caregiver_type}</Typography>
        <Typography>₦{v.user_amount_offered}</Typography>
        <Button
          variant="contained"
          sx={{
            mt: 1,
            bgcolor: "#dd700a",
            "&:hover": { bgcolor: "#b55a07" },
            textTransform: "none",
          }}
        >
          Apply
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>Available Vacancies</Typography>

      <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
        <Tab label="Caregiver" />
        <Tab label="Parent/Guardian" />
      </Tabs>


      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={2} justifyContent="center">
          {tabValue === 0 &&
            (caregiverVacancies.length > 0 ? caregiverVacancies.map(renderCaregiverCard) : (
              <Typography>No caregiver vacancies available</Typography>
            ))}

          {tabValue === 1 &&
            (userVacancies.length > 0 ? userVacancies.map(renderUserCard) : (
              <Typography>No user vacancies available</Typography>
            ))}
        </Grid>
      )}
    </Box>
  );
};

export default UserVacancies;
