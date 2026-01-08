// src/App.js
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Hero from './components/Hero';
import Vacancy from './components/Vacancy';
import FocusedOnSafety from './components/FocusedOnsafety';
import WhyChooseUs from './components/WhyChooseUs';
import Testimonials from './components/Testimonials';
import HowItWorks from './components/HowItWorks';
import AboutUs from './components/AboutUs';
import CTASection from './components/CTASection';
import Login from './pages/Login';
import Register from './pages/Register';
import FacebookAdsForm from './pages/FacebookAdsForm';
import ThankYou from './pages/ThankYou';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import WaitingList from './pages/WaitingList';
import About from './pages/About';
import Faqs from './pages/Faqs';
import TermsAndConditions from './pages/TermsAndConditions';
import HelperTerms from './pages/CaregiverTerms';
import Privacy from './pages/Privacy';
import Payment from './pages/Payment';
import Subscription from './pages/Subscription';
import UserDashboardLayout from './components/UserDashboardLayout';
// User Dashboard
import Dashboard from './pages/Dashboard';
import Request from './pages/Dashboard/Request';
import MyRequest from './pages/Dashboard/MyRequest';
import Messages from './pages/Dashboard/Messages';
import MyAccount from './pages/Dashboard/MyAccount';
import Notification from './pages/Dashboard/Notification';
import Support from './pages/Dashboard/Support';
import Review from './pages/Dashboard/Review';
import InterestedCaregiver from './pages/Dashboard/InterestedCaregiver';
import ApprovedCaregiver from './pages/Dashboard/ApprovedCaregiver';
import RequestStep2 from './pages/Dashboard/RequestStep2';
import RequestStep3 from './pages/Dashboard/RequestStep3';
import RequestStep4 from './pages/Dashboard/RequestStep4';
import RequestStep5 from './pages/Dashboard/RequestStep5';

import CreateJob from './pages/Dashboard/CreateJob';
import MyJobs from './pages/Dashboard/MyJobs';
import Application from './pages/Dashboard/Applications';
// Caregiver Dashboard
import CaregiverDashboard from './pages/Caregiver/Dashboard';
import AvailableRequest from './pages/Caregiver/AvailableRequest';
import MyInterests from './pages/Caregiver/MyInterests';
import MyEngagement from './pages/Caregiver/MyEngagement';
import MyMessages from './pages/Caregiver/MyMessages';
import MyReviews from './pages/Caregiver/MyReviews';
import CaregiverReview from './pages/Caregiver/Review';
import Profile from './pages/Caregiver/Profile';
import KYC from './pages/Caregiver/kyc';
import Notifications from './pages/Caregiver/Notifications';
import Earnings from './pages/Caregiver/Earnings';
import Schedule from './pages/Caregiver/Schedule';
import CaregiverSupport from './pages/Caregiver/Support';

import Jobs from './pages/Caregiver/Jobs';
import JobDetails from './pages/Caregiver/JobDetails';
import MyApplications from './pages/Caregiver/MyApplication';
// Admin Dashboard (Excluded from AuthProvider)
import AdminApp from './admin/AdminApp';
// Context
import { AuthProvider } from './context/AuthContext';

function Home() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Vacancy />
      <AboutUs />
      <HowItWorks />
      <FocusedOnSafety />
      <Testimonials />
      <CTASection />
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes - excluded from AuthProvider */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* All Other Routes Wrapped in AuthProvider */}
        <Route
          path="*"
          element={
            <AuthProvider>
              <Routes>
                <Route path="/" element={<Layout><Home /></Layout>} />
                <Route path="/about" element={<Layout><About /></Layout>} />
                <Route path="/faq" element={<Layout><Faqs /></Layout>} />
                <Route path="/privacy-policy" element={<Layout><Privacy /></Layout>} />
                <Route path="/terms-and-conditions" element={<Layout><TermsAndConditions /></Layout>} />
                <Route path="/helper-terms" element={<Layout><HelperTerms /></Layout>} />
                <Route path="/waiting-list" element={<Layout><WaitingList /></Layout>} />
                <Route path="/login" element={<Layout><Login /></Layout>} />
                <Route path="/register" element={<Layout><Register /></Layout>} />
                <Route path="/apply" element={<FacebookAdsForm />} />
                <Route path="/application-successful" element={<ThankYou />} />
                <Route path="/forgot-password" element={<Layout><ForgotPassword /></Layout>} />
                <Route path="/reset-password/:category/:token" element={<Layout><ResetPassword /></Layout>} />
                <Route path="/payment" element={<Layout><Payment /></Layout>} />
                <Route path="/subscription" element={<Layout><Subscription /></Layout>} />

                {/* User Dashboard Section - Now wrapped in UserDashboardLayout */}
                <Route path="/dashboard" element={<UserDashboardLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="request" element={<Request />} />
                  <Route path="my-requests" element={<MyRequest />} />
                  <Route path="messages" element={<Messages />} />
                  <Route path="review" element={<Review />} />
                  <Route path="account" element={<MyAccount />} />
                  <Route path="notifications" element={<Notification />} />
                  <Route path="support" element={<Support />} />
                  <Route path="interested-caregiver" element={<InterestedCaregiver />} />
                  <Route path="approved-caregiver" element={<ApprovedCaregiver />} />
                  <Route path="request-step2" element={<RequestStep2 />} />
                  <Route path="request-step3" element={<RequestStep3 />} />
                  <Route path="request-step4" element={<RequestStep4 />} />
                  <Route path="request-step5" element={<RequestStep5 />} />

                  <Route path="create-job" element={<CreateJob />} />
                  <Route path="my-jobs" element={<MyJobs />} />
                  <Route path="application" element={<Application />} />
                </Route>

                {/* Caregiver Dashboard Section */}
                <Route path="/caregiver/dashboard" element={<CaregiverDashboard />} />
                <Route path="/caregiver/available-requests" element={<AvailableRequest />} />
                <Route path="/caregiver/my-interests" element={<MyInterests />} />
                <Route path="/caregiver/my-engagements" element={<MyEngagement />} />
                <Route path="/caregiver/messages" element={<MyMessages />} />
                <Route path="/caregiver/my-reviews" element={<MyReviews />} />
                <Route path="/caregiver/profile" element={<Profile />} />
                <Route path="/caregiver/kyc" element={<KYC />} />
                 <Route path="/caregiver/review" element={<CaregiverReview/>} />
                <Route path="/caregiver/notifications" element={<Notifications />} />
                <Route path="/caregiver/earnings" element={<Earnings />} />
                <Route path="/caregiver/schedule" element={<Schedule />} />
                <Route path="/caregiver/support" element={<CaregiverSupport />} />
                
                <Route path="/caregiver/jobs" element={<Jobs />} />
                <Route path="/caregiver/jobs/:id" element={<JobDetails />} />
                <Route path="/caregiver/my-applications" element={<MyApplications />} />
              </Routes>
            </AuthProvider>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
