import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import TreasurerDashboardNew from '../components/treasurer/TreasurerDashboardNew';
import Background3D from '../components/Background3D';

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
    <div className="min-h-screen relative overflow-hidden font-inter text-[#F5F3E7]">
      <Background3D />
      
      {/* Logout Button - Fixed in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 bg-black/60 backdrop-blur-md text-[#E8E3C5] hover:text-[#A6C36F] hover:bg-black/80 rounded-lg shadow-lg transition-all duration-200 border border-[#A6C36F]/20 hover:border-[#A6C36F]/50"
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
