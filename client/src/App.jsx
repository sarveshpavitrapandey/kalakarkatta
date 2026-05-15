import Header from "./components/Header.jsx";
import Hero from "./components/Hero.jsx";
import Mission from "./components/Mission.jsx";
import Offerings from "./components/Offerings.jsx";
import Events from "./components/Events.jsx";
import Creators from "./components/Creators.jsx";
import Stories from "./components/Stories.jsx";
import Resources from "./components/Resources.jsx";
import Join from "./components/Join.jsx";
import Support from "./components/Support.jsx";
import Footer from "./components/Footer.jsx";
import UploadPage from "./components/UploadPage.jsx";
import Feed from "./components/Feed.jsx";
import Profile from "./components/Profile.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignupPage from "./pages/SignupPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import VerifyEmailPage from "./pages/VerifyEmailPage.jsx";
import VerificationSentPage from "./pages/VerificationSentPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import CreateJob from "./pages/CreateJob.jsx";
import CreateEvent from "./pages/CreateEvent.jsx";
import MyEvents from "./pages/MyEvents.jsx";
import MyJobs from "./pages/MyJobs.jsx";
import DiscoverEvents from "./pages/DiscoverEvents.jsx";
import DiscoverJobs from "./pages/DiscoverJobs.jsx";
import Community from "./pages/Community.jsx";
import MessagesDashboard from "./pages/MessagesDashboard.jsx";
import ChatbotWidget from "./components/ChatbotWidget.jsx";

import { Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Hero />
                <Mission />
                <Offerings />
                <Events />
                <Creators />
                <Stories />
                <Resources />
                <Join />
                <Support />
              </>
            }
          />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify/:token" element={<VerifyEmailPage />} />
          <Route path="/verification-sent" element={<VerificationSentPage />} />

          {/* Protected Routes */}
          <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
          <Route path="/upload" element={<ProtectedRoute><UploadPage /></ProtectedRoute>} />
          <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
          <Route path="/create-event" element={<ProtectedRoute><CreateEvent /></ProtectedRoute>} />
          <Route path="/my-events" element={<ProtectedRoute><MyEvents /></ProtectedRoute>} />
          <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
          <Route path="/feed" element={<ProtectedRoute><Feed /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          
          {/* Discover Routes */}
          <Route path="/events" element={<ProtectedRoute><DiscoverEvents /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><DiscoverJobs /></ProtectedRoute>} />
          <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
          
          {/* Chat / Messages */}
          <Route path="/messages" element={<ProtectedRoute><MessagesDashboard /></ProtectedRoute>} />
          <Route path="/messages/:id" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        </Routes>
        <ChatbotWidget />
      </main>
      <Footer />
    </>
  );
}