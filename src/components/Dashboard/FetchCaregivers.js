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
  const currentPlan = (user?.current_plan || '').toLowerCase();
  const hasActiveExpiry = !!(user?.plan_expires_at && new Date(user.plan_expires_at) > new Date());
  const isPremium =
    (currentPlan.includes('one-time') ||
      currentPlan.includes('all-inclusive') ||
      currentPlan.includes('bundle') ||
      currentPlan.includes('premium')) &&
    hasActiveExpiry;

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
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <Skeleton variant="circular" width={48} height={48} className="sm:w-14 sm:h-14" />
          <div className="flex-1">
            <Skeleton variant="text" width="80%" height={20} className="sm:h-6" />
            <Skeleton variant="text" width="60%" height={16} className="sm:h-5" />
          </div>
        </div>
        <div className="space-y-2 mb-4">
          <Skeleton variant="text" width="100%" height={16} className="sm:h-5" />
          <Skeleton variant="text" width="90%" height={16} className="sm:h-5" />
          <Skeleton variant="text" width="70%" height={16} className="sm:h-5" />
        </div>
        <Skeleton variant="rounded" width="100%" height={36} className="sm:h-10" />
      </CardContent>
    </Card>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10">
      {/* Header Section */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="flex flex-col space-y-2 sm:space-y-1">
          <Typography 
            variant="h5" 
            className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800"
          >
            Featured Caregivers
          </Typography>
          <Typography variant="body2" className="text-sm sm:text-base text-gray-600">
            {isPremium 
              ? "Discover our top-rated caregivers" 
              : "Preview some of our available caregivers"}
          </Typography>
        </div>
        
        {/* View All Button - Full width on mobile, auto on desktop */}
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
              px: { xs: 2, sm: 3 },
              py: { xs: 1, sm: 1.3 },
              width: { xs: '100%', sm: 'auto' },
              minWidth: { xs: 'auto', sm: '200px' },
            }}
            endIcon={!isPremium && <Lock fontSize="small" />}
          >
            {isPremium ? "View All Caregivers" : "Subscribe to View All"}
          </Button>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" className="mb-4 sm:mb-6 rounded-lg text-sm sm:text-base">
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3 sm:space-y-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty State */}
      {!loading && featuredCaregivers.length === 0 && (
        <div className="text-center py-12 sm:py-16 px-4 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl sm:text-3xl">👤</span>
          </div>
          <Typography variant="h6" className="text-lg sm:text-xl text-gray-800 mb-2">
            No Caregivers Available
          </Typography>
          <Typography variant="body2" className="text-sm sm:text-base text-gray-600">
            Check back later for featured caregivers
          </Typography>
        </div>
      )}

      {/* Caregiver Cards - Responsive Layout */}
      {!loading && featuredCaregivers.length > 0 && (
        <div className="space-y-3 sm:space-y-4">
          {featuredCaregivers.map((cg, index) => (
            <Card 
              key={cg.id} 
              className="rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <CardContent className="p-4 sm:p-5 md:p-6">
                {/* Main Content - Responsive Flex Layout */}
                <div className="flex flex-col space-y-4 sm:space-y-0">
                  
                  {/* Top Section: Avatar and Basic Info */}
                  <div className="flex items-start gap-3 sm:gap-4">
                    <Avatar
                      src={
                        cg.profile_image
                          ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}`
                          : DEFAULT_AVATAR
                      }
                      alt={cg.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 border-2 border-[#648E87] shrink-0"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <Typography variant="h6" className="text-base sm:text-lg font-semibold text-gray-800 break-words">
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
                        className="text-gray-600 text-xs sm:text-sm break-words"
                      >
                        {cg.email || "—"} 
                        {cg.phone && ` • ${cg.phone}`}
                      </Typography>
                      
                      <Typography variant="body2" className="text-gray-600 text-xs sm:text-sm mt-1">
                        {cg.gender ? cg.gender.charAt(0).toUpperCase() + cg.gender.slice(1) : "—"} 
                        {cg.speciality && ` • ${cg.speciality}`}
                      </Typography>
                    </div>
                  </div>

                  {/* Bottom Section: Salary Card */}
                  <div className="w-full">
                    <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                      <div className="flex flex-col space-y-1">
                        <Typography variant="caption" className="text-gray-500 text-xs sm:text-sm">
                          Salary Range
                        </Typography>
                        <Typography variant="body1" className="font-semibold text-[#648E87] text-base sm:text-lg">
                          {formatSalary(cg.salary_range)}
                        </Typography>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))}

          {/* Bottom CTA for Free Users */}
          {!isPremium && (
            <div className="mt-6 sm:mt-8 p-4 sm:p-6 bg-gradient-to-r from-[#648E87]/5 to-[#dd700a]/5 rounded-xl text-center">
              <Typography variant="body1" className="text-sm sm:text-base text-gray-700 mb-3 sm:mb-4">
                Want to see all available caregivers and their full profiles?
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate("/subscription")}
                sx={{
                  backgroundColor: "#648E87",
                  "&:hover": {
                    backgroundColor: "#4F726C",
                  },
                  textTransform: "none",
                  borderRadius: "12px",
                  px: { xs: 3, sm: 4 },
                  py: { xs: 1, sm: 1.5 },
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: { xs: 'auto', sm: '200px' },
                }}
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