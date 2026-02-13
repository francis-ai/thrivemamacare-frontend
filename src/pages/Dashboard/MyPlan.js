import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuthUser } from "../../context/AuthContextUser";
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Skeleton,
  Paper,
  Button,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  Info,
  AttachMoney,
  AccessTime,
  People,
  Label,
  WorkspacePremium,
} from "@mui/icons-material";

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function MyPlan() {
  const { user } = useAuthUser();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get(
          `${BASE_URL}/api/users/my-plan/${user.id}`
        );

        setPlan(res.data.plan);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch your plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, [user?.id]);

  const parsedFeatures =
    typeof plan?.features === "string"
      ? JSON.parse(plan.features)
      : plan?.features;

  // Skeleton loader for responsive design
  const PlanSkeleton = () => (
    <Card className="shadow-lg rounded-2xl overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton variant="rounded" width={80} height={24} />
        </div>
        <Divider className="mb-4" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex justify-between">
              <Skeleton variant="text" width={100} height={20} />
              <Skeleton variant="text" width={80} height={20} />
            </div>
          ))}
          <Skeleton variant="rounded" width="100%" height={100} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header Section - Responsive */}
        <div className="mb-6 sm:mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Typography 
                variant="h4" 
                className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2"
              >
                <WorkspacePremium className="text-[#648E87] text-2xl sm:text-3xl" />
                My Subscription Plan
              </Typography>
              <Typography 
                variant="body2" 
                className="text-sm sm:text-base text-gray-600 mt-2"
              >
                View and manage your current subscription details
              </Typography>
            </div>
          </div>
          <Divider className="mt-4" />
        </div>

        {/* Loading State - Responsive Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <PlanSkeleton />
          </div>
        )}

        {/* Error Alert - Mobile Optimized */}
        {error && !loading && (
          <Alert 
            severity="error" 
            className="mb-4 sm:mb-6 rounded-lg sm:rounded-xl"
            icon={<Cancel />}
            sx={{
              '& .MuiAlert-message': {
                padding: '8px 0',
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }
            }}
          >
            <Typography variant="body2" className="font-medium">
              {error}
            </Typography>
            <Typography variant="caption" className="text-xs sm:text-sm block mt-1">
              Please try refreshing the page or contact support.
            </Typography>
          </Alert>
        )}

        {/* No Plan State - Beautiful Empty State */}
        {!loading && !plan && !error && (
          <Paper 
            elevation={0}
            className="p-6 sm:p-8 md:p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300"
          >
            <div className="flex flex-col items-center max-w-md mx-auto">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 bg-[#648E87]/10 mb-4">
                <Cancel className="text-[#648E87] text-3xl sm:text-4xl" />
              </Avatar>
              <Typography 
                variant="h6" 
                className="text-lg sm:text-xl font-semibold text-gray-800 mb-2"
              >
                No Active Subscription
              </Typography>
              <Typography 
                variant="body2" 
                className="text-sm sm:text-base text-gray-600 mb-6"
              >
                You don't have an active subscription plan at the moment. 
                Choose a plan that best fits your needs.
              </Typography>
              <Button 
                variant="contained" 
                className="w-full sm:w-auto px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base bg-[#648E87] hover:bg-[#4F726C]"
                size="large"
                href="/plans"
              >
                Browse Available Plans
              </Button>
            </div>
          </Paper>
        )}

        {/* Plan Card - Fully Responsive */}
        {plan && (
          <div className="space-y-4 sm:space-y-6">
            {/* Main Plan Card */}
            <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Card Header with Gradient - Using Primary Color #648E87 */}
              <div className="bg-gradient-to-r from-[#648E87] to-[#4F726C] px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-3">
                  <div>
                    <Typography 
                      variant="h5" 
                      className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words"
                    >
                      {plan.plan_name}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <Label className="text-white/80 text-sm" />
                      <Typography 
                        variant="caption" 
                        className="text-white/80 text-xs sm:text-sm"
                      >
                        ID: {plan.plan_slug}
                      </Typography>
                    </div>
                  </div>
                  <Chip 
                    label="Active" 
                    size="small"
                    icon={<CheckCircle />}
                    className="self-start xs:self-center bg-[#dd700a] text-white font-medium"
                  />
                </div>
              </div>

              <CardContent className="p-4 sm:p-6 md:p-8">
                {/* Key Metrics Grid - Responsive */}
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                  {/* Price Card */}
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 sm:p-3 bg-[#648E87]/10 rounded-lg">
                      <AttachMoney className="text-[#648E87] text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Typography variant="caption" className="text-gray-500 text-xs block">
                        Price
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800 text-base sm:text-lg truncate">
                        ₦{plan.price?.toLocaleString()}
                      </Typography>
                    </div>
                  </div>

                  {/* Duration Card */}
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 sm:p-3 bg-[#dd700a]/10 rounded-lg">
                      <AccessTime className="text-[#dd700a] text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Typography variant="caption" className="text-gray-500 text-xs block">
                        Duration
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800 text-base sm:text-lg truncate">
                        {plan.duration_days} Days
                      </Typography>
                    </div>
                  </div>

                  {/* Profile Access Card */}
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="p-2 sm:p-3 bg-[#648E87]/10 rounded-lg">
                      <People className="text-[#648E87] text-lg sm:text-xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Typography variant="caption" className="text-gray-500 text-xs block">
                        Helper Access
                      </Typography>
                      <Typography variant="h6" className="font-bold text-gray-800 text-base sm:text-lg truncate">
                        {plan.profile_access_limit
                          ? `${plan.profile_access_limit} Profiles`
                          : "Unlimited"}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Features Section - Responsive Grid */}
                <div className="mt-6 sm:mt-8">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="text-[#648E87] text-lg sm:text-xl" />
                    <Typography 
                      variant="h6" 
                      className="text-base sm:text-lg font-semibold text-gray-800"
                    >
                      Plan Features
                    </Typography>
                    <Chip 
                      label={`${parsedFeatures?.length || 0} items`}
                      size="small"
                      className="bg-gray-100 text-gray-700 ml-2"
                    />
                  </div>

                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {Array.isArray(parsedFeatures) && parsedFeatures.length > 0 ? (
                      parsedFeatures.map((feature, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-2 bg-gradient-to-r from-[#648E87]/5 to-[#dd700a]/5 border border-[#648E87]/20 rounded-lg p-2 sm:p-3 hover:shadow-md transition-shadow"
                        >
                          <CheckCircle className="text-[#648E87] text-sm sm:text-base flex-shrink-0 mt-0.5" />
                          <span className="text-gray-800 text-xs sm:text-sm font-medium break-words">
                            {feature}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full bg-gray-50 border border-gray-200 rounded-lg p-4 sm:p-6 text-center">
                        <Info className="text-gray-400 text-3xl sm:text-4xl mb-2 mx-auto" />
                        <Typography variant="body2" className="text-gray-500">
                          No features listed for this plan
                        </Typography>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Help Card - Mobile Responsive with Secondary Color */}
            <Paper elevation={0} className="p-4 sm:p-6 bg-gradient-to-r from-[#dd700a]/5 to-[#dd700a]/10 rounded-xl">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                <div className="p-2 bg-[#dd700a] rounded-lg self-start sm:self-center">
                  <Info className="text-white text-lg sm:text-xl" />
                </div>
                <div className="flex-1">
                  <Typography variant="body2" className="text-[#dd700a] font-medium text-sm sm:text-base">
                    Need assistance with your subscription?
                  </Typography>
                  <Typography variant="caption" className="text-[#648E87] text-xs sm:text-sm block mt-1">
                    Our support team is available 24/7 to help you with any questions.
                  </Typography>
                </div>
              </div>
            </Paper>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}



