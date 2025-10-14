// src/pages/UserVacancies.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  IconButton,
  Paper,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Person, FamilyRestroom } from "@mui/icons-material";

const BASE_URL = process.env.REACT_APP_BASE_URL;

const UserVacancies = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [scrollPos, setScrollPos] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/admin/vacancy`);
        setVacancies(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const scrollContainer = (dir) => {
    const container = document.getElementById("scroll-container");
    if (container) {
      const newPos = dir === "left" ? Math.max(0, scrollPos - 300) : scrollPos + 300;
      container.scrollTo({ left: newPos, behavior: "smooth" });
      setScrollPos(newPos);
    }
  };

  const cards = (type) => {
    const filtered = vacancies.filter(v => v.category === type);
    if (!filtered.length)
      return (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <Typography>No {type === "caregiver" ? "caregivers" : "jobs"} available</Typography>
        </Paper>
      );

    return filtered.map(v => (
      <Card
        key={v.id}
        sx={{
          minWidth: 280,
          maxWidth: 320,
          borderRadius: 3,
          boxShadow: "0 6px 24px rgba(0,0,0,0.08)",
          flexShrink: 0,
          mr: 2,
          transition: "0.3s",
          "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" },
        }}
      >
        <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              src={v.caregiver_image ? `${BASE_URL}/${v.caregiver_image}` : undefined}
              sx={{ width: 50, height: 50, bgcolor: v.category === "user" ? "#dd700a" : "primary.light" }}
            >
              {v.category === "caregiver" ? <Person /> : <FamilyRestroom />}
            </Avatar>
            <Box>
              <Typography fontWeight={700} variant="subtitle1">
                {v.category === "caregiver" ? v.caregiver_name : "Care Needed"}
              </Typography>
              {v.category === "caregiver" && (
                <Typography variant="body2" color="text.secondary">
                  {v.caregiver_address}
                </Typography>
              )}
            </Box>
          </Stack>

          {v.category === "caregiver" && (
            <Chip label={v.job_offer} size="small" color="primary" sx={{ fontWeight: 600 }} />
          )}

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {v.category === "caregiver" ? v.caregiver_bio : v.user_job_description}
          </Typography>

          <Typography fontWeight={700} color={v.category === "caregiver" ? "primary.main" : "#dd700a"}>
            ₦{v.category === "caregiver" ? v.caregiver_rate : v.user_amount_offered}
          </Typography>

          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: v.category === "caregiver" ? "#648E87" : "#dd700a",
              "&:hover": { bgcolor: v.category === "caregiver" ? "#557870" : "#b55a07" },
              textTransform: "none",
              mt: 1,
              borderRadius: 2,
            }}
          >
            {v.category === "caregiver" ? "Book Now" : "Apply Now"}
          </Button>
        </CardContent>
      </Card>
    ));
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 4 }, bgcolor: "grey.50" }}>
      <Box textAlign="center" mb={4}>
        <Typography
          variant="h4"
          fontWeight={600}
          sx={{
            mb: 1,
            background: "linear-gradient(135deg, #648E87, #dd700a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Find Your Perfect Match
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover qualified caregivers or post your caregiving needs
        </Typography>
      </Box>

      <Paper sx={{ mb: 3, maxWidth: 400, mx: "auto", borderRadius: 3, boxShadow: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, val) => setTabValue(val)}
          centered
          sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 700, px: 3 } }}
          TabIndicatorProps={{ style: { backgroundColor: tabValue === 0 ? "#648E87" : "#dd700a", height: 3 } }}
        >
          <Tab icon={<Person />} iconPosition="start" label="Caregivers" />
          <Tab icon={<FamilyRestroom />} iconPosition="start" label="Jobs" />
        </Tabs>
      </Paper>

      <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
        {isMobile && (
          <>
            <IconButton
              onClick={() => scrollContainer("left")}
              sx={{
                position: "absolute",
                left: -10,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                bgcolor: "white",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <ChevronLeft />
            </IconButton>
            <IconButton
              onClick={() => scrollContainer("right")}
              sx={{
                position: "absolute",
                right: -10,
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 2,
                bgcolor: "white",
                "&:hover": { bgcolor: "grey.100" },
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
            <CircularProgress size={50} sx={{ color: "#648E87" }} />
          </Box>
        ) : (
          <Box
            id="scroll-container"
            sx={{
              display: "flex",
              justifyContent: isMobile ? "flex-start" : "center",
              overflowX: isMobile ? "auto" : "visible",
              flexWrap: isMobile ? "nowrap" : "wrap",
              gap: 2,
              pb: 2,
              px: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {tabValue === 0 ? cards("caregiver") : cards("user")}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default UserVacancies;
