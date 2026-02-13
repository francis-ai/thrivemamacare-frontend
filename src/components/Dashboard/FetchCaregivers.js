import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthUser } from "../../context/AuthContextUser";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  Skeleton,
  Alert,
} from "@mui/material";
import { Verified, Pending, Lock } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function FetchAllCaregiver() {
  const navigate = useNavigate();
  const { user } = useAuthUser();
  const isPremium = user?.is_premium;

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch caregivers
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(`${BASE_URL}/api/users/caregivers`);
        setCaregivers(res.data.caregivers);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch caregivers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  // Determine featured caregivers
  let featuredCaregivers = [];

  if (caregivers.length > 0) {
    if (isPremium) {
      featuredCaregivers = caregivers.filter((cg) => cg.status === "verified");
      if (featuredCaregivers.length < 3) {
        const remaining = caregivers.filter((cg) => cg.status !== "verified");
        const needed = 3 - featuredCaregivers.length;
        const randomFill = remaining
          .sort(() => 0.5 - Math.random())
          .slice(0, needed);
        featuredCaregivers = [...featuredCaregivers, ...randomFill];
      }
      featuredCaregivers = featuredCaregivers.slice(0, 3);
    } else {
      const pendingCaregivers = caregivers.filter(
        (cg) => cg.status !== "verified"
      );
      featuredCaregivers = pendingCaregivers
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
    }
  }

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return "—";
    return `₦${salary.toLocaleString()}`;
  };

  // Skeleton loader
  const CardSkeleton = () => (
    <Card className="rounded-xl overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton variant="circular" width={56} height={56} />
          <div className="flex-1">
            <Skeleton variant="text" width="80%" height={24} />
            <Skeleton variant="text" width="60%" height={20} />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton variant="text" width="100%" height={20} />
          <Skeleton variant="text" width="90%" height={20} />
          <Skeleton variant="text" width="70%" height={20} />
        </div>
        <Skeleton variant="rounded" width="100%" height={40} />
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <Typography 
            variant="h5" 
            className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800"
          >
            Featured Caregivers
          </Typography>
          <Typography variant="body2" className="text-gray-600 mt-1">
            {isPremium 
              ? "Discover our top-rated caregivers" 
              : "Preview some of our available caregivers"}
          </Typography>
        </div>
        
        {/* View All Button */}
        {!loading && featuredCaregivers.length > 0 && (
          <Button
            variant="contained"
            onClick={() =>
              navigate(isPremium ? "/dashboard/caregivers" : "/subscription")
            }
            sx={{
              backgroundColor: isPremium ? "#648E87" : "#dd700a",
              "&:hover": {
                backgroundColor: isPremium ? "#4F726C" : "#b85c08",
              },
              textTransform: "none",
              borderRadius: "12px",
              fontWeight: 600,
              boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
              px: 3,
              py: 1.3,
            }}
            endIcon={!isPremium && <Lock fontSize="small" />}
          >
            {isPremium ? "View All Caregivers" : "Subscribe to View All"}
          </Button>
        )}

      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-6 rounded-lg">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!loading && featuredCaregivers.length === 0 && (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">👤</span>
          </div>
          <Typography variant="h6" className="text-gray-800 mb-2">
            No Caregivers Available
          </Typography>
          <Typography variant="body2" className="text-gray-600">
            Check back later for featured caregivers
          </Typography>
        </div>
      )}

      {/* Caregiver Cards - Stacked Layout */}
      {!loading && featuredCaregivers.length > 0 && (
        <div className="space-y-4">
          {featuredCaregivers.map((cg, index) => (
            <Card 
              key={cg.id} 
              className="rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <CardContent className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 w-full">
                  {/* Avatar and Basic Info - Mobile: Row, Desktop: Row */}
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar
                      src={
                        cg.profile_image
                          ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}`
                          : DEFAULT_AVATAR
                      }
                      alt={cg.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#648E87]"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Typography variant="h6" className="text-base sm:text-lg font-semibold text-gray-800">
                          {cg.name || "—"}
                        </Typography>
                        <Chip
                          icon={cg.status === "verified" ? <Verified /> : <Pending />}
                          label={cg.status === "verified" ? "Verified" : "Pending"}
                          size="small"
                          className={`
                            ${cg.status === "verified" 
                              ? "bg-[#648E87]/10 text-[#648E87]" 
                              : "bg-[#dd700a]/10 text-[#dd700a]"
                            }
                            font-medium text-xs
                          `}
                        />
                      </div>
                      
                      <Typography
                        variant="body2"
                        className="text-gray-600 mb-1 break-words"
                      >
                        {cg.email || "—"} • {cg.phone || "—"}
                      </Typography>

                      
                      <Typography variant="body2" className="text-gray-600">
                        {cg.gender ? cg.gender.charAt(0).toUpperCase() + cg.gender.slice(1) : "—"} 
                        {cg.speciality && ` • ${cg.speciality}`}
                      </Typography>
                    </div>
                  </div>

                  {/* Salary and Action - Mobile: Stack below, Desktop: Row */}
                  <div className="sm:ml-auto w-full sm:w-auto">
                    <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
                      
                      <div className="text-left sm:text-right">
                        <Typography variant="caption" className="text-gray-500 block">
                          Salary Range
                        </Typography>
                        <Typography variant="body1" className="font-semibold text-[#648E87]">
                          {formatSalary(cg.salary_range)}
                        </Typography>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Additional Info for Mobile (Optional) */}
                {index < featuredCaregivers.length - 1 && (
                  <div className="block sm:hidden border-b border-gray-100 mt-4"></div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Bottom CTA for Free Users */}
          {!isPremium && (
            <div className="mt-8 p-6 bg-gradient-to-r from-[#648E87]/5 to-[#dd700a]/5 rounded-xl text-center">
              <Typography variant="body1" className="text-gray-700 mb-4">
                Want to see all available caregivers and their full profiles?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/subscription")}
                className="bg-[#648E87] hover:bg-[#4F726C] text-white px-8 py-3 shadow-md hover:shadow-lg transition-all"
                endIcon={<Lock />}
              >
                Subscribe Now
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}