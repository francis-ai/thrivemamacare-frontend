import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuthUser } from "../../context/AuthContextUser";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const DEFAULT_AVATAR =
  "https://cdn-icons-png.flaticon.com/512/149/149071.png";

export default function FetchAllCaregiver() {
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

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">
        Featured Caregivers
      </h2>

      {loading && <p className="text-center text-gray-500">Loading caregivers...</p>}
      {error && <p className="text-center text-red-500 mb-4">{error}</p>}
      {!loading && featuredCaregivers.length === 0 && (
        <p className="text-center text-gray-500">No featured caregivers available.</p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {featuredCaregivers.map((cg) => (
          <div
            key={cg.id}
            className="relative bg-white rounded-xl shadow-md hover:shadow-xl transition p-6 flex flex-col items-center"
          >
            {/* Status Badge */}
            <span
              className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold ${
                cg.status === "verified"
                  ? "bg-green-100 text-green-700"
                  : "bg-orange-100 text-orange-700"
              }`}
            >
              {cg.status.toUpperCase()}
            </span>

            {/* Avatar */}
            <img
              src={
                cg.profile_image
                  ? `${BASE_URL}/uploads/caregivers/${cg.profile_image}`
                  : DEFAULT_AVATAR
              }
              alt={cg.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 mb-4"
            />

            <h3 className="text-lg font-medium text-center mb-1">{cg.name}</h3>
            <p className="text-sm text-gray-500 truncate mb-1">{cg.email}</p>
            <p className="text-sm text-gray-500 mb-1">{cg.phone}</p>
            <p className="text-sm text-gray-500 mb-3">{cg.gender}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
