import React from 'react';
import TreasurerDashboardNew from '../components/treasurer/TreasurerDashboardNew';
import Background3D from '../components/Background3D';

/**
 * Treasurer Dashboard Page
 * Wraps the treasurer dashboard component with logout functionality
 */
const TreasurerDashboard = () => {
  return (
    <div className="min-h-screen relative overflow-hidden font-inter text-[#F5F3E7]">
      <Background3D />
      {/* Main Treasurer Dashboard Component */}
      <TreasurerDashboardNew />
    </div>
  );
};

export default TreasurerDashboard;
