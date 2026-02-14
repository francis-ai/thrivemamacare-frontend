import React, { useEffect, useState } from "react";
import axios from "axios";
import { Verified, Pending } from "@mui/icons-material";
import { useAuthUser } from "../context/AuthContextUser";
import { useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function FetchAllCaregiver() {
  const { user } = useAuthUser();
  const navigate = useNavigate();

  const [caregivers, setCaregivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCaregivers = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await axios.get(`${BASE_URL}/api/users/caregivers`);
        setCaregivers(res.data.caregivers || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch caregivers.");
      } finally {
        setLoading(false);
      }
    };

    fetchCaregivers();
  }, []);

  // Pick top 3 caregivers (verified first)
  let featuredCaregivers = [];
  if (caregivers.length > 0) {
    const verified = caregivers.filter((cg) => cg.status === "verified");
    const others = caregivers.filter((cg) => cg.status !== "verified");
    featuredCaregivers = [...verified];

    if (featuredCaregivers.length < 3) {
      const needed = 3 - featuredCaregivers.length;
      const randomFill = others.sort(() => 0.5 - Math.random()).slice(0, needed);
      featuredCaregivers = [...featuredCaregivers, ...randomFill];
    }

    featuredCaregivers = featuredCaregivers.slice(0, 3);
  }

  const handleViewCaregiver = (cgId) => {
    if (user) {
      // User is logged in, go to dashboard or caregiver detail page
      navigate(`/dashboard/caregivers`);
    } else {
      // Not logged in, redirect to login page
      navigate("/login");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Featured Caregivers</h2>
      <p className="text-gray-600 mb-6">Carefully selected caregivers available right now</p>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-xl animate-pulse bg-gray-100">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-300"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-6 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      ) : featuredCaregivers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Caregivers Available</h3>
          <p className="text-gray-600">Check back later for featured caregivers</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCaregivers.map((cg) => (
            <div
              key={cg.id}
              className="bg-white border border-gray-100 rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={cg.profile_image ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}` : DEFAULT_AVATAR}
                  alt={cg.name}
                  className="w-16 h-16 rounded-full border-2 border-[#648E87] object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h5 className="font-semibold text-gray-800">{cg.name || "—"}</h5>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        cg.status === "verified"
                          ? "bg-[#648E87]/10 text-[#648E87]"
                          : "bg-[#dd700a]/10 text-[#dd700a]"
                      } flex items-center gap-1`}
                    >
                      {cg.status === "verified" ? <Verified fontSize="small" /> : <Pending fontSize="small" />}
                      {cg.status === "verified" ? "Verified" : "Not Verified"}
                    </span>
                  </div>
                  {/* <p className="text-gray-600 text-sm break-words">
                    {cg.email || "—"} • {cg.phone || "—"}
                  </p> */}
                  <p className="text-gray-600 text-sm">
                    {cg.gender ? cg.gender.charAt(0).toUpperCase() + cg.gender.slice(1) : "—"}
                    {cg.speciality && ` • ${cg.speciality}`}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-xl text-center">
                <p className="text-gray-500 text-xs">Salary Range</p>
                <p className="font-semibold text-[#648E87]">
                  ₦{cg.salary_range || "—"}
                </p>
              </div>

              {/* View Caregiver Button */}
              <button
                onClick={handleViewCaregiver}
                className="mt-2 bg-[#648E87] hover:bg-[#4f706a] text-white font-semibold py-2 px-4 rounded-lg transition"
              >
                View Caregiver
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
