import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import EmailVerificationPage from './pages/EmailVerificationPage'
import Dashboard from './pages/Dashboard'
import AiStatsPage from './pages/AiStatsPage'
import PomodoroPage from './pages/PomodoroPage'
import PlanPage from './pages/PlanPage'
import ProfilePage from './pages/ProfilePage'
import PricingPage from './pages/PricingPage'
import AdminDashboard from './pages/AdminDashboard'

// Layout
import Layout from './components/Layout'

import OnboardingPage from './pages/OnboardingPage'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect to onboarding if not completed and not admin
  if (user?.role !== 'ADMIN' && !user?.onboardingCompleted && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  if (user?.role === 'ADMIN' && location.pathname === '/dashboard') {
    return <Navigate to="/admin" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, user } = useAuthStore()

  if (isAuthenticated && (user?.onboardingCompleted || user?.role === 'ADMIN')) {
    if (user?.role === 'ADMIN') {
      return <Navigate to="/admin" replace />
    }
    return <Navigate to="/dashboard" replace />
  }

  return children
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/verify-email"
          element={
            <PublicRoute>
              <EmailVerificationPage />
            </PublicRoute>
          }
        />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/ai-stats"
          element={
            <ProtectedRoute>
              <Layout>
                <AiStatsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/pomodoro"
          element={
            <ProtectedRoute>
              <Layout>
                <PomodoroPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Layout>
                <PricingPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/plans"
          element={
            <ProtectedRoute>
              <Layout>
                <PlanPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Layout>
                <AdminDashboard />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  )
}
