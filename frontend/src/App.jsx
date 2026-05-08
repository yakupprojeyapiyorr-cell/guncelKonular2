import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import Dashboard from './pages/Dashboard'
import LessonsPage from './pages/LessonsPage'
import ExamPage from './pages/ExamPage'
import StatsPage from './pages/StatsPage'
import PomodoroPage from './pages/PomodoroPage'
import PlanPage from './pages/PlanPage'
import AdminPanel from './pages/AdminPanel'
import ProfilePage from './pages/ProfilePage'
import PracticePage from './pages/PracticePage'

// Layout
import Layout from './components/Layout'

import OnboardingPage from './pages/OnboardingPage'

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Redirect to onboarding if not completed and not admin
  if (user?.role !== 'ADMIN' && !user?.onboardingCompleted && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
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
          path="/lessons"
          element={
            <ProtectedRoute>
              <Layout>
                <LessonsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/exams"
          element={
            <ProtectedRoute>
              <Layout>
                <ExamPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/stats"
          element={
            <ProtectedRoute>
              <Layout>
                <StatsPage />
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
          path="/plans"
          element={
            <ProtectedRoute>
              <Layout>
                <PlanPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/practice"
          element={
            <ProtectedRoute>
              <Layout>
                <PracticePage />
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
                <AdminPanel />
              </Layout>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  )
}
