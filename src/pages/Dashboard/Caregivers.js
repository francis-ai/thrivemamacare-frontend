import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuthUser } from "../../context/AuthContextUser";
import { 
  Snackbar, 
  Alert, 
  Button, 
  TextField,
  Drawer,
  Box,
  IconButton,
  Rating,
  Divider,
  Avatar,
  Chip,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography
} from "@mui/material";
import {
  Search,
  FilterList,
  Close,
  Verified,
  Pending,
  Email,
  Phone,
  LocationOn,
  Work,
  AttachMoney,
  Star,
  StarBorder,
  Female,
  Male,
  Send,
  ChevronRight
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function AllCaregiversPage() {
  const { user } = useAuthUser();
  const navigate = useNavigate();
  const isPremium = user?.is_premium;

  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
  
  // Side panel state
  const [selectedCaregiver, setSelectedCaregiver] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  
  // Review state
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    speciality: "",
    gender: "",
    status: "",
    minSalary: "",
    maxSalary: "",
  });
  
  const [salaryRange, setSalaryRange] = useState([0, 1000000]);

  const perPage = 8;

  // Fetch caregivers
  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/users/caregivers`);
        setCaregivers(res.data.caregivers || []);
        setFilteredCaregivers(res.data.caregivers || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch caregivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...caregivers];

    // Search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(cg => 
        cg.name?.toLowerCase().includes(term) ||
        cg.email?.toLowerCase().includes(term) ||
        cg.speciality?.toLowerCase().includes(term) ||
        cg.phone?.includes(term)
      );
    }

    // Speciality filter
    if (filters.speciality) {
      filtered = filtered.filter(cg => 
        cg.speciality?.toLowerCase() === filters.speciality.toLowerCase()
      );
    }

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(cg => cg.gender === filters.gender);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(cg => cg.status === filters.status);
    }

    // Salary range filter
    filtered = filtered.filter(cg => {
      const salary = parseFloat(cg.salary_range) || 0;
      return salary >= salaryRange[0] && salary <= salaryRange[1];
    });

    setFilteredCaregivers(filtered);
  }, [searchTerm, filters, salaryRange, caregivers]);

  const getDisplayedCaregivers = () => {
    if (!isPremium) return filteredCaregivers.slice(0, 4);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return filteredCaregivers.slice(start, end);
  };

  const displayedCaregivers = getDisplayedCaregivers();
  const totalPages = Math.ceil(filteredCaregivers.length / perPage);

  const showToast = (message, severity = "success") => 
    setToast({ open: true, message, severity });

  // Fetch caregiver reviews
  const fetchReviews = async (caregiverId) => {
    try {
      setLoadingReviews(true);
      const res = await axios.get(`${BASE_URL}/api/users/caregiver-reviews/${caregiverId}`);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handle view profile
  const handleViewProfile = async (caregiver) => {
    setSelectedCaregiver(caregiver);
    setPanelOpen(true);
    await fetchReviews(caregiver.id);
    setUserRating(0);
    setUserComment("");
  };

  // Handle submit review
  const handleSubmitReview = async () => {
    if (!userRating) {
      showToast("Please select a rating", "error");
      return;
    }

    try {
      setSubmittingReview(true);
      await axios.post(`${BASE_URL}/api/users/caregiver-review`, {
        user_id: user.id,
        caregiver_id: selectedCaregiver.id,
        rating: userRating,
        comment: userComment,
      });
      
      showToast("Review submitted successfully!", "success");
      setUserRating(0);
      setUserComment("");
      await fetchReviews(selectedCaregiver.id);
    } catch (err) {
      console.error("Error submitting review:", err);
      showToast("Failed to submit review.", "error");
    } finally {
      setSubmittingReview(false);
    }
  };

  // Get unique specialities for filter
  const uniqueSpecialities = useMemo(() => {
    return [...new Set(caregivers.map(cg => cg.speciality).filter(Boolean))];
  }, [caregivers]);

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      speciality: "",
      gender: "",
      status: "",
      minSalary: "",
      maxSalary: "",
    });
    setSalaryRange([0, 1000000]);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">All Caregivers</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: perPage }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            All Caregivers
          </h2>
          
          {/* Premium Badge for Users */}
          {isPremium && (
            <Chip
              icon={<Star style={{ color: '#FFD700' }} />}
              label="Premium Access"
              className="bg-[#648E87] text-white font-semibold px-4 py-1 self-start sm:self-auto"
            />
          )}
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search by name, email, speciality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className="text-gray-400" />
                </InputAdornment>
              ),
              className: "bg-white rounded-lg"
            }}
            size="small"
          />
          
          <Button
            variant="outlined"
            onClick={() => setFilterOpen(!filterOpen)}
            className="border-[#648E87] text-[#648E87] hover:border-[#4F726C] hover:bg-[#648E87]/5 min-w-[100px]"
            startIcon={<FilterList />}
          >
            Filters
          </Button>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-700">Filter Caregivers</h3>
              <Button
                size="small"
                onClick={resetFilters}
                className="text-[#648E87]"
              >
                Reset All
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Speciality Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel>Speciality</InputLabel>
                <Select
                  value={filters.speciality}
                  label="Speciality"
                  onChange={(e) => setFilters({...filters, speciality: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  {uniqueSpecialities.map(spec => (
                    <MenuItem key={spec} value={spec}>{spec}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Gender Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={filters.gender}
                  label="Gender"
                  onChange={(e) => setFilters({...filters, gender: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                </Select>
              </FormControl>

              {/* Status Filter */}
              <FormControl size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  label="Status"
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>

              {/* Salary Range Filter */}
              <div className="col-span-full lg:col-span-1">
                <Typography gutterBottom className="text-sm text-gray-600">
                  Salary Range (₦)
                </Typography>
                <div className="flex items-center gap-2">
                  <TextField
                    size="small"
                    placeholder="Min"
                    value={filters.minSalary}
                    onChange={(e) => setFilters({...filters, minSalary: e.target.value})}
                    className="w-full"
                  />
                  <span>-</span>
                  <TextField
                    size="small"
                    placeholder="Max"
                    value={filters.maxSalary}
                    onChange={(e) => setFilters({...filters, maxSalary: e.target.value})}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert severity="error" onClose={() => setError("")} className="mb-6">
            {error}
          </Alert>
        )}

        {/* Empty State */}
        {!loading && filteredCaregivers.length === 0 && !error && (
          <div className="text-center py-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Search className="text-gray-500 text-3xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No caregivers found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}

        {/* Caregivers Grid */}
        {displayedCaregivers.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {displayedCaregivers.map((cg) => (
                <div
                  key={cg.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-[#648E87]/30 overflow-hidden"
                >
                  {/* Card Header with Status */}
                  <div className="relative h-20 bg-gradient-to-r from-[#648E87]/10 to-[#dd700a]/5">
                    <span
                      className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        cg.status === "verified"
                          ? "bg-[#648E87] text-white"
                          : "bg-[#dd700a] text-white"
                      }`}
                    >
                      {cg.status === "verified" ? (
                        <Verified className="text-xs" />
                      ) : (
                        <Pending className="text-xs" />
                      )}
                      {cg.status === "verified" ? "Verified" : "Pending"}
                    </span>
                    
                    {/* Avatar */}
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                      <div className="relative">
                        <img
                          src={
                            cg.profile_image
                              ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}`
                              : DEFAULT_AVATAR
                          }
                          alt={cg.name}
                          className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg group-hover:scale-105 transition-transform"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="pt-10 p-4 text-center">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">
                      {cg.name || "—"}
                    </h3>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {cg.speciality || "General Caregiver"}
                    </p>

                    {/* Quick Info */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-3">
                      {cg.gender && (
                        <span className="flex items-center gap-1">
                          {cg.gender === "female" ? (
                            <Female className="text-pink-500 text-xs" />
                          ) : (
                            <Male className="text-blue-500 text-xs" />
                          )}
                          {cg.gender}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        ₦{cg.salary_range || " -- "}
                      </span>
                    </div>

                    {/* Location */}
                    {cg.address && (
                      <p className="text-xs text-gray-400 mb-4 flex items-center justify-center gap-1">
                        <LocationOn className="text-xs" />
                        {cg.address}
                      </p>
                    )}

                    {/* View Profile Button */}
                    <button
                      onClick={() => handleViewProfile(cg)}
                      className="w-full bg-[#648E87] text-white py-2.5 rounded-lg hover:bg-[#4f706a] transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      View Profile
                      <ChevronRight className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination for Premium Users */}
            {isPremium && totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <Button
                  variant="outlined"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="border-[#648E87] text-[#648E87]"
                >
                  Previous
                </Button>
                <span className="flex items-center px-4 text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outlined"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="border-[#648E87] text-[#648E87]"
                >
                  Next
                </Button>
              </div>
            )}

            {/* Count Summary */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Showing {displayedCaregivers.length} of {filteredCaregivers.length} caregivers
              {!isPremium && caregivers.length > 4 && " · Subscribe to see all"}
            </p>
          </>
        )}

        {/* Premium Upgrade Button */}
        {!isPremium && caregivers.length > 4 && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="contained"
              onClick={() => navigate("/subscription")}
              className="bg-[#dd700a] hover:bg-[#b85c08] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Subscribe to See All Caregivers
            </Button>
          </div>
        )}

        {/* Side Panel Drawer */}
        <Drawer
          anchor="right"
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          PaperProps={{
            className: "w-full sm:w-96 md:w-112 lg:w-128 rounded-l-2xl",
            style: { maxWidth: "100%" }
          }}
        >
          {selectedCaregiver && (
            <Box className="h-full overflow-y-auto">
              {/* Drawer Header */}
              <div className="sticky top-0 bg-white z-10 p-4 border-b flex justify-between items-center">
                <Typography variant="h6" className="font-semibold text-gray-800">
                  Caregiver Profile
                </Typography>
                <IconButton onClick={() => setPanelOpen(false)}>
                  <Close />
                </IconButton>
              </div>

              <div className="p-5">
                {/* Profile Header */}
                <div className="text-center mb-6">
                  <Avatar
                    src={
                      selectedCaregiver.profile_image
                        ? `${BASE_URL}/uploads/caregivers/${selectedCaregiver.profile_image}`
                        : DEFAULT_AVATAR
                    }
                    alt={selectedCaregiver.name}
                    className="w-24 h-24 mx-auto mb-3 border-4 border-[#648E87]"
                  />
                  
                  <h3 className="text-xl font-bold text-gray-800">
                    {selectedCaregiver.name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <Chip
                      icon={selectedCaregiver.status === "verified" ? <Verified /> : <Pending />}
                      label={selectedCaregiver.status === "verified" ? "Verified" : "Pending"}
                      className={
                        selectedCaregiver.status === "verified"
                          ? "bg-[#648E87] text-white"
                          : "bg-[#dd700a] text-white"
                      }
                      size="small"
                    />
                    
                    {selectedCaregiver.rating && (
                      <Chip
                        icon={<Star className="text-yellow-400" />}
                        label={selectedCaregiver.rating}
                        className="bg-gray-100"
                        size="small"
                      />
                    )}
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Contact Information */}
                <div className="space-y-3 mb-4">
                  <Typography variant="subtitle2" className="text-gray-700 font-semibold mb-2">
                    Contact Information
                  </Typography>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Email className="text-[#648E87] text-sm" />
                    <span>{selectedCaregiver.email || "—"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="text-[#648E87] text-sm" />
                    <span>{selectedCaregiver.phone || "—"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <LocationOn className="text-[#648E87] text-sm" />
                    <span>{selectedCaregiver.address || "—"}</span>
                  </div>
                </div>

                <Divider className="my-4" />

                {/* Professional Information */}
                <div className="space-y-3 mb-4">
                  <Typography variant="subtitle2" className="text-gray-700 font-semibold mb-2">
                    Professional Details
                  </Typography>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Work className="text-[#dd700a] text-sm" />
                    <span>Speciality: {selectedCaregiver.speciality || "General"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <AttachMoney className="text-[#648E87] text-sm" />
                    <span>Salary Range: ₦{selectedCaregiver.salary_range}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {selectedCaregiver.gender === "female" ? (
                      <Female className="text-pink-500 text-sm" />
                    ) : (
                      <Male className="text-blue-500 text-sm" />
                    )}
                    <span className="capitalize">Gender: {selectedCaregiver.gender || "—"}</span>
                  </div>
                </div>

                {/* About Section */}
                {selectedCaregiver.bio && (
                  <>
                    <Divider className="my-4" />
                    <div className="mb-4">
                      <Typography variant="subtitle2" className="text-gray-700 font-semibold mb-2">
                        About
                      </Typography>
                      <Typography variant="body2" className="text-gray-600">
                        {selectedCaregiver.bio}
                      </Typography>
                    </div>
                  </>
                )}

                <Divider className="my-4" />

                {/* Reviews Section */}
                <div className="mb-4">
                  <Typography variant="subtitle2" className="text-gray-700 font-semibold mb-3">
                    Reviews & Ratings
                  </Typography>

                  {/* Review Form */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <Typography variant="body2" className="font-medium mb-2">
                      Leave a Review
                    </Typography>
                    
                    <Rating
                      value={userRating}
                      onChange={(e, newValue) => setUserRating(newValue)}
                      className="mb-2"
                    />
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Share your experience with this caregiver..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      variant="outlined"
                      size="small"
                      className="mb-2"
                    />
                    
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSubmitReview}
                      disabled={submittingReview}
                      className="bg-[#648E87] hover:bg-[#4F726C] text-white"
                      endIcon={<Send />}
                    >
                      {submittingReview ? "Submitting..." : "Submit Review"}
                    </Button>
                  </div>

                  {/* Reviews List */}
                  {loadingReviews ? (
                    <div className="text-center py-4">
                      <p className="text-gray-500">Loading reviews...</p>
                    </div>
                  ) : reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.map((review, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Rating value={review.rating} size="small" readOnly />
                            <span className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <Typography variant="body2" className="text-gray-700">
                            {review.comment}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500 block mt-1">
                            — {review.user_name}
                          </Typography>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-lg">
                      <StarBorder className="text-gray-400 text-3xl mb-2" />
                      <Typography variant="body2" className="text-gray-500">
                        No reviews yet. Be the first to review!
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </Box>
          )}
        </Drawer>

        {/* Toast/Snackbar */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ open: false, message: "", severity: "success" })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity={toast.severity} sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>
    </DashboardLayout>
  );
}