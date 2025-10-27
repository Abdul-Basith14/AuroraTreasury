import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/treasurer-dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-4xl font-bold">Payment Requests</h1>
                <p className="text-blue-100 mt-1">
                  Verify and manage member payment submissions
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending Requests
          </button>
          <button
            onClick={() => setActiveTab('resubmissions')}
            className={`px-6 py-3 rounded-lg font-medium transition ${
              activeTab === 'resubmissions'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900'
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
