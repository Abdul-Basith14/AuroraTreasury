import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getStatistics, getWallet } from '../../utils/treasurerAPI';
import { Users, Wallet, ClipboardCheck, FileText as ReimburseIcon } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('members'); // 'overview', 'members', 'wallet'
  
  useEffect(() => {
    fetchStatistics();
    fetchWallet();
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatistics();
        fetchWallet();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Listen for wallet updates from child component (WalletManagement)
    const handleWalletUpdate = () => {
      fetchWallet();
    };
    window.addEventListener('walletUpdated', handleWalletUpdate);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('walletUpdated', handleWalletUpdate);
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
    <div className="min-h-screen font-inter text-[#F5F3E7]">
      
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl py-8 px-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border-b border-[#A6C36F]/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[#F5F3E7]">Treasurer Dashboard</h1>
              <p className="text-[#E8E3C5]/70">Manage AuroraTreasury club finances</p>
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/treasurer/payment-requests')}
                className="px-6 py-3 bg-[#A6C36F] text-black rounded-2xl font-semibold hover:bg-[#8FAE5D] transition flex items-center shadow-lg hover:shadow-[0_0_15px_rgba(166,195,111,0.4)]"
              >
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Payment Requests
                {statistics?.pendingResubmissions > 0 && (
                  <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    {statistics.pendingResubmissions}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('/treasurer/reimbursement-requests')}
                className="px-6 py-3 bg-black/40 text-[#F5F3E7] rounded-2xl font-semibold hover:bg-[#A6C36F]/10 transition flex items-center shadow-lg border border-[#A6C36F]/20 hover:border-[#A6C36F]/50"
              >
                <ReimburseIcon className="w-5 h-5 mr-2 text-[#A6C36F]" />
                Reimbursement Requests
                {statistics?.reimbursementPending > 0 && (
                  <span className="ml-2 px-2 py-1 bg-[#A6C36F] text-black text-xs rounded-full font-bold">
                    {statistics.reimbursementPending}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <RectCard
            title="Total Members"
            value={statistics?.totalMembers || 0}
            subtitle="Registered"
            icon={Users}
            loading={statsLoading}
          />

          <RectCard
            title="Total Wallet"
            value={`₹${walletBalance.toLocaleString('en-IN')}`}
            subtitle="Club funds"
            icon={Wallet}
            loading={statsLoading}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-2 border-b border-[#A6C36F]/20">
            {/* Members Tab */}
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#A6C36F] text-[#A6C36F] bg-[#A6C36F]/10'
                  : 'text-[#E8E3C5]/60 hover:text-[#F5F3E7] hover:bg-[#A6C36F]/5'
              }`}
            >
              📋 Members List by Month
            </button>
            {/* Wallet Tab */}
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'wallet'
                  ? 'border-b-2 border-[#A6C36F] text-[#A6C36F] bg-[#A6C36F]/10'
                  : 'text-[#E8E3C5]/60 hover:text-[#F5F3E7] hover:bg-[#A6C36F]/5'
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
 * Rectangular Card used for simplified Treasurer Dashboard (Themed)
 */
const RectCard = ({ title, value, subtitle, icon: Icon, loading }) => {
  if (loading) {
    return (
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_20px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20 animate-pulse">
        <div className="h-6 bg-[#A6C36F]/10 rounded w-24 mb-4"></div>
        <div className="h-8 bg-[#A6C36F]/10 rounded w-32"></div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-xl border border-[#A6C36F]/20 rounded-2xl p-6 shadow-[0_0_20px_rgba(166,195,111,0.08)] hover:shadow-[0_0_25px_rgba(166,195,111,0.15)] transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-[#A6C36F]/10 rounded-xl border border-[#A6C36F]/20 group-hover:bg-[#A6C36F]/20 transition-colors">
            <Icon className="w-6 h-6 text-[#A6C36F]" />
          </div>
          <div>
            <div className="text-sm text-[#E8E3C5]/80 font-medium">{title}</div>
            <div className="text-3xl font-bold text-[#F5F3E7] mt-1">{value}</div>
          </div>
        </div>
      </div>
      {subtitle && <div className="text-xs text-[#E8E3C5]/50 pl-1">{subtitle}</div>}
    </div>
  );
};

export default TreasurerDashboardNew;