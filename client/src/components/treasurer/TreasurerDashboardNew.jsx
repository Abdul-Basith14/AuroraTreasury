import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getStatistics, getWallet } from '../../utils/treasurerAPI';
import { Users, IndianRupee, AlertCircle, Clock, Wallet, ClipboardCheck } from 'lucide-react';
import WalletManagement from './WalletManagement';
import MembersListByMonth from './MembersListByMonth';

/**
 * New Treasurer Dashboard
 * Simplified dashboard with wallet management and month-based member list
 */
const TreasurerDashboardNew = () => {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'members', 'wallet'
  
  useEffect(() => {
    fetchStatistics();
    fetchWallet();
    
    // Refresh stats when page becomes visible again (user navigates back)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatistics();
        fetchWallet();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  /**
   * Fetch dashboard statistics
   */
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const data = await getStatistics();
      setStatistics(data.overall);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  /**
   * Fetch wallet balance
   */
  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      setWalletBalance(data.wallet.balance);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Treasurer Dashboard</h1>
              <p className="text-blue-100">Manage AuroraTreasury club finances</p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/treasurer/payment-requests')}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition flex items-center shadow-lg"
              >
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Payment Requests
                {statistics?.pendingResubmissions > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {statistics.pendingResubmissions}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Members */}
          <StatCard
            title="Total Members"
            value={statistics?.totalMembers || 0}
            subtitle="Registered"
            icon={Users}
            gradient="from-blue-500 to-blue-600"
            loading={statsLoading}
          />
          
          {/* Total Collection */}
          <StatCard
            title="Total Collection"
            value={`₹${statistics?.totalCollection || 0}`}
            subtitle="All payments"
            icon={IndianRupee}
            gradient="from-green-500 to-green-600"
            loading={statsLoading}
          />
          
          {/* Failed Payments */}
          <StatCard
            title="Failed"
            value={statistics?.failedPayments || 0}
            subtitle="Need attention"
            icon={AlertCircle}
            gradient="from-red-500 to-red-600"
            loading={statsLoading}
          />
          
          {/* Pending Verification */}
          <StatCard
            title="Pending"
            value={statistics?.pendingPayments || 0}
            subtitle="To review"
            icon={Clock}
            gradient="from-yellow-500 to-yellow-600"
            loading={statsLoading}
          />
          
          {/* Wallet Balance */}
          <StatCard
            title="Wallet Balance"
            value={`₹${walletBalance.toLocaleString('en-IN')}`}
            subtitle="Club funds"
            icon={Wallet}
            gradient="from-purple-500 to-purple-600"
            loading={false}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
                activeTab === 'members'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              📋 Members List by Month
            </button>
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 ${
                activeTab === 'wallet'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              💰 Wallet Management
            </button>
          </div>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'members' && <MembersListByMonth />}
        {activeTab === 'wallet' && <WalletManagement />}
      </div>
    </div>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ title, value, subtitle, icon: Icon, gradient, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
        <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }
  
  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-10 h-10 opacity-80" />
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{title}</div>
      <div className="text-xs opacity-75 mt-2">{subtitle}</div>
    </div>
  );
};

export default TreasurerDashboardNew;
