import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * Protects routes that require authentication and specific roles
 * 
 * Usage:
 * <Route path="/member-dashboard" element={
 *   <ProtectedRoute allowedRoles={['member']}>
 *     <MemberDashboard />
 *   </ProtectedRoute>
 * } />
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Allow treasurer to access member routes (treasurer is also a member)
    if (allowedRoles.includes('member') && user?.role === 'treasurer') {
      return children;
    }

    // Redirect to appropriate dashboard based on their actual role
    if (user?.role === 'treasurer') {
      return <Navigate to="/treasurer-dashboard" replace />;
    } else {
      return <Navigate to="/member-dashboard" replace />;
    }
  }

  // User is authenticated and has correct role
  return children;
};

export default ProtectedRoute;
