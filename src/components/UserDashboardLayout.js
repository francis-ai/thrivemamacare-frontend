import { Outlet } from "react-router-dom";
import FloatingPlanButton from "./FloatingPlanButton";
import { useAuthUser } from '../context/AuthContextUser';

export default function UserDashboardLayout() {
  const { user } = useAuthUser();
  const currentPlan = user?.plan || "Free";

  return (
    <>
      <Outlet /> {/* Renders child routes (e.g., /dashboard, /dashboard/request) */}
      <FloatingPlanButton currentPlan={currentPlan} />
    </>
  );
}