import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle both flat user objects and nested { token, user: {} } payloads
  const actualUser = user.user ? user.user : user;
  const isComplete = actualUser.onboardingComplete;

  // If user is logged in but hasn't completed onboarding, and they aren't already on the onboarding page
  if (!isComplete && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // If user HAS completed onboarding, and they try to visit the onboarding page again, redirect to feed
  if (isComplete && location.pathname === '/onboarding') {
    return <Navigate to="/feed" replace />;
  }

  return children;
}
