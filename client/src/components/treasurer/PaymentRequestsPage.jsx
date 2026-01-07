import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react'; 
import { toast } from 'react-hot-toast';
import PendingRequestsTab from './PendingRequestsTab';
import ResubmissionsTab from './ResubmissionsTab';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

/**
 * Payment Requests Page - Main page for managing payment verification
 * Displays pending requests and resubmissions in separate tabs
 */
const PaymentRequestsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Trigger refresh for child components
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    // Global Layout Rule: body className="bg-[#0B0B09] min-h-screen"
    <div className={`min-h-screen bg-[${BACKGROUND_PRIMARY}]`}>
      {/* Header */}
      <div 
        // Header background uses Panel color and divider border
        className={`bg-[${BACKGROUND_SECONDARY}] py-8 px-6 shadow-xl border-b border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/treasurer-dashboard')}
                // Themed Back Button: soft colors, hover effect
                className={`p-2 hover:bg-[${BORDER_DIVIDER}]/50 rounded-lg transition text-[${TEXT_SECONDARY}]`}
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className={`text-4xl font-bold text-[${TEXT_PRIMARY}] flex items-center`}>
                    {/* Icon tone: text-[#A6C36F]/80 */}
                    <CheckCircle className={`w-8 h-8 mr-3 text-[${ACCENT_OLIVE}]`} />
                    Payment Requests
                </h1>
                {/* Text Secondary for subtext */}
                <p className={`text-[${TEXT_SECONDARY}]/80 mt-1`}>
                  Verify and manage member payment submissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div 
          // Card Container/Panel rules applied to tab bar
          className={`bg-[${BACKGROUND_SECONDARY}] rounded-2xl p-1 inline-flex ring-1 ring-[${BORDER_DIVIDER}]/50 ${SHADOW_GLOW}`}
        >
          {/* Pending Requests Tab */}
          <button
            onClick={() => setActiveTab('pending')}
            // Button Styling: Accent Olive for active, muted for inactive
            className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
              activeTab === 'pending'
                // Active button (d) Button (Accent Olive)
                ? `bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] shadow-md hover:bg-[#8FAE5D]`
                // Inactive tab
                : `text-[${TEXT_SECONDARY}]/90 hover:bg-[${BORDER_DIVIDER}]/50`
            }`}
          >
            Pending Requests
          </button>
          
          {/* Resubmissions Tab */}
          <button
            onClick={() => setActiveTab('resubmissions')}
            // Button Styling: Accent Olive for active, muted for inactive
            className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
              activeTab === 'resubmissions'
                // Active button (d) Button (Accent Olive)
                ? `bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] shadow-md hover:bg-[#8FAE5D]`
                // Inactive tab
                : `text-[${TEXT_SECONDARY}]/90 hover:bg-[${BORDER_DIVIDER}]/50`
            }`}
          >
            Resubmissions
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'pending' && (
          <PendingRequestsTab 
            refreshTrigger={refreshTrigger} 
            onActionComplete={handleRefresh}
          />
        )}
        {activeTab === 'resubmissions' && (
          <ResubmissionsTab 
            refreshTrigger={refreshTrigger} 
            onActionComplete={handleRefresh}
          />
        )}
      </div>
    </div>
  );
};

export default PaymentRequestsPage;