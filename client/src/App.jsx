import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import MemberDashboard from './pages/MemberDashboard';
import TreasurerDashboard from './pages/TreasurerDashboard';
import PaymentRequestsPage from './components/treasurer/PaymentRequestsPage';
import MembersByMonthPage from './components/treasurer/MembersByMonthPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public Routes - Redirect to dashboard if already logged in */}
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              user?.role === 'treasurer' ? (
                <Navigate to="/treasurer-dashboard" replace />
              ) : (
                <Navigate to="/member-dashboard" replace />
              )
            ) : (
              <Login />
            )
          }
        />
        <Route
          path="/signup"
          element={
            isAuthenticated ? (
              user?.role === 'treasurer' ? (
                <Navigate to="/treasurer-dashboard" replace />
              ) : (
                <Navigate to="/member-dashboard" replace />
              )
            ) : (
              <Signup />
            )
          }
        />

        {/* Protected Routes - Member Dashboard */}
        <Route
          path="/member-dashboard"
          element={
            <ProtectedRoute allowedRoles={['member']}>
              <MemberDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Treasurer Dashboard */}
        <Route
          path="/treasurer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['treasurer']}>
              <TreasurerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Treasurer Payment Requests */}
        <Route
          path="/treasurer/payment-requests"
          element={
            <ProtectedRoute allowedRoles={['treasurer']}>
              <PaymentRequestsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Treasurer Members by Month */}
        <Route
          path="/treasurer/members-by-month"
          element={
            <ProtectedRoute allowedRoles={['treasurer']}>
              <MembersByMonthPage />
            </ProtectedRoute>
          }
        />

        {/* Default Route - Redirect to login or appropriate dashboard */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              user?.role === 'treasurer' ? (
                <Navigate to="/treasurer-dashboard" replace />
              ) : (
                <Navigate to="/member-dashboard" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* 404 Route - Catch all */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <a
                  href="/"
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
