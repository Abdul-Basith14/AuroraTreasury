import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react'; 
import { toast } from 'react-hot-toast';
import PendingRequestsTab from './PendingRequestsTab';
import ResubmissionsTab from './ResubmissionsTab';

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
    <div className="min-h-screen bg-black text-[#F5F3E7]">
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl py-8 px-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border-b border-[#A6C36F]/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/treasurer-dashboard')}
                className="p-2 hover:bg-[#A6C36F]/10 rounded-lg transition text-[#E8E3C5] hover:text-[#A6C36F]"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-[#F5F3E7] flex items-center">
                    <CheckCircle className="w-8 h-8 mr-3 text-[#A6C36F]" />
                    Payment Requests
                </h1>
                <p className="text-[#E8E3C5]/80 mt-1">
                  Verify and manage member payment submissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-black/40 rounded-2xl p-1 inline-flex border border-[#A6C36F]/20 shadow-[0_0_25px_rgba(166,195,111,0.08)]">
          {/* Pending Requests Tab */}
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
              activeTab === 'pending'
                ? 'bg-[#A6C36F] text-black shadow-md hover:bg-[#8FAE5D]'
                : 'text-[#E8E3C5]/90 hover:bg-[#A6C36F]/10 hover:text-[#F5F3E7]'
            }`}
          >
            Pending Requests
          </button>
          
          {/* Resubmissions Tab */}
          <button
            onClick={() => setActiveTab('resubmissions')}
            className={`px-6 py-3 rounded-xl font-medium transition duration-300 ${
              activeTab === 'resubmissions'
                ? 'bg-[#A6C36F] text-black shadow-md hover:bg-[#8FAE5D]'
                : 'text-[#E8E3C5]/90 hover:bg-[#A6C36F]/10 hover:text-[#F5F3E7]'
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