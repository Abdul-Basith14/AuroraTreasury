import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import TreasurerDashboardNew from '../components/treasurer/TreasurerDashboardNew';

/**
 * Treasurer Dashboard Page
 * Wraps the treasurer dashboard component with logout functionality
 */
const TreasurerDashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Logout Button - Fixed in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-white text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg shadow-lg transition-all duration-200 border border-gray-200"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </button>
      </div>

      {/* Main Treasurer Dashboard Component */}
      <TreasurerDashboardNew />
    </div>
  );
};

export default TreasurerDashboard;
