import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import ManageCaregivers from './pages/ManageCaregivers';
import ManageUsers from './pages/ManageUsers';
import Requests from './pages/Requests';
import Reviews from './pages/Reviews';
import Earnings from './pages/Earnings';
import Messages from './pages/Messages';
import Notifications from './pages/Notifications';
import Support from './pages/Support';
import LegalInfo from './pages/LegalInfo';
import Settings from './pages/Settings';
import Subscription from './pages/Subscription';
import Vacancy from './pages/Vacancy';
import Login from './pages/Login';

const AdminApp = () => {
  const token = localStorage.getItem('adminToken');

  return (
    <Routes>
      {/* Public login route */}
      <Route path="login" element={<Login />} />

      {/* Protected admin routes */}
      {token ? (
        <Route path="/" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="caregivers" element={<ManageCaregivers />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="requests" element={<Requests />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="earnings" element={<Earnings />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="support" element={<Support />} />
          <Route path="legal-info" element={<LegalInfo />} />
          <Route path="subscription" element={<Subscription />} />
          <Route path="vacancy" element={<Vacancy />} />
          <Route path="settings" element={<Settings />} />
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
      ) : (
        // Redirect any /admin/* access to login if not authenticated
        <Route path="/admin/*" element={<Navigate to="login" replace />} />
      )}

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminApp;
