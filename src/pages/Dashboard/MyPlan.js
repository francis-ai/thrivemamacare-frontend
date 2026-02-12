import React, { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../../components/Dashboard/DashboardLayout";
import { useAuthUser } from "../../context/AuthContextUser";
import { Snackbar, Alert, Button } from "@mui/material"; // Added Button import
import { useNavigate } from "react-router-dom"; // Add this import

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_AVATAR = "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function MyPlan() {
  const { user } = useAuthUser();
  const navigate = useNavigate(); // Add this
  const isPremium = user?.is_premium;

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState({ open: false, message: "" });

  const perPage = 8;

  console.log(setCurrentPage)

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BASE_URL}/api/users/caregivers`);
        setCaregivers(res.data.caregivers || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch caregivers. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  const getDisplayedCaregivers = () => {
    if (!isPremium) return caregivers.slice(0, 4);
    const start = (currentPage - 1) * perPage;
    const end = start + perPage;
    return caregivers.slice(start, end);
  };

  const displayedCaregivers = getDisplayedCaregivers();
  const showToast = (message) => setToast({ open: true, message });

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">All Caregivers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: perPage }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow p-4 animate-pulse h-64"
              />
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-6">All Caregivers</h2>

        {/* Error */}
        {error && (
          <div className="mb-4">
            <Alert severity="error" onClose={() => setError("")}>
              {error}
            </Alert>
          </div>
        )}

        {/* Empty State */}
        {!loading && caregivers.length === 0 && !error && (
          <p className="text-center text-gray-500 py-20">
            No caregivers found.
          </p>
        )}

        {/* Caregivers Grid */}
        {displayedCaregivers.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative">
            {displayedCaregivers.map((cg) => (
              <div
                key={cg.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-4 flex flex-col items-center relative"
              >
                {/* Status Badge */}
                <span
                  className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${
                    cg.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }`}
                >
                  {cg.status}
                </span>

                {/* Avatar */}
                <img
                  src={
                    cg.profile_image
                      ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}`
                      : DEFAULT_AVATAR
                  }
                  alt={cg.name}
                  className="w-20 h-20 rounded-full object-cover border-2 mb-4"
                />

                <h3 className="text-lg font-medium text-center">{cg.name}</h3>
                <p className="text-sm text-gray-500 truncate">{cg.email}</p>
                <p className="text-sm text-gray-500">{cg.phone}</p>
                <p className="text-sm text-gray-500">{cg.gender}</p>

                <button
                  onClick={() => showToast(`Action for ${cg.name}`)}
                  className="mt-auto w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        )}

        {/* OPTION 2: Using MUI Button with React Router */}
        {!isPremium && caregivers.length > 3 && (
          <div className="mt-8 flex justify-center">
            <Button
              variant="contained"
              onClick={() => navigate("/subscription")}
              sx={{
                backgroundColor: '#eab308',
                color: 'white',
                fontWeight: 600,
                padding: '12px 32px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: '#ca8a04',
                }
              }}
            >
              Subscribe to See All Caregivers
            </Button>
          </div>
        )}

        {/* Count Summary */}
        {displayedCaregivers.length > 0 && (
          <p className="mt-6 text-center text-gray-500">
            Showing {displayedCaregivers.length} of {caregivers.length} caregivers
            {!isPremium && caregivers.length > 4 && " · Upgrade to see all"}
          </p>
        )}

        {/* Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={3000}
          onClose={() => setToast({ open: false, message: "" })}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <Alert severity="success" sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </div>
    </DashboardLayout>
  );
}