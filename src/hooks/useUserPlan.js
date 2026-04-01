import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthUser } from '../context/AuthContextUser';

const BASE_URL = process.env.REACT_APP_BASE_URL;

export default function useUserPlan() {
  const { user, setUser } = useAuthUser();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    let mounted = true;

    const fetchPlan = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${BASE_URL}/api/subscriptions/user-plan/${user.id}`);
        if (!mounted) return;
        setPlanData(res.data);

        // Sync into global auth user + localStorage so other components using `user` see it
        try {
          const updatedUser = {
            ...(user || {}),
            current_plan: res.data.currentPlan,
            plan_expires_at: res.data.expiresAt,
          };
          if (setUser) setUser(updatedUser);
          try {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } catch (e) {
            // ignore localStorage failures
          }
        } catch (e) {
          console.error('Failed syncing plan into auth user:', e);
        }
      } catch (err) {
        if (!mounted) return;
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPlan();

    const interval = setInterval(fetchPlan, 60000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [user?.id]);

  const currentPlanString = (
    planData?.currentPlan || user?.current_plan || ''
  ).toLowerCase();

  const expiresAt = planData?.expiresAt || user?.plan_expires_at;
  const hasActiveExpiry = !!(expiresAt && new Date(expiresAt) > new Date());

  const isPremium = (
    currentPlanString.includes('one-time') ||
    currentPlanString.includes('all-inclusive') ||
    currentPlanString.includes('bundle') ||
    currentPlanString.includes('premium') ||
    currentPlanString.includes('inclusive')
  ) && hasActiveExpiry;

  return { planData, isPremium, loading, error };
}
