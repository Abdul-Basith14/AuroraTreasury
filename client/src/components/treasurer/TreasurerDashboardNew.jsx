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
  
  // --- Theme Tokens ---
  const BACKGROUND_PRIMARY = '#0B0B09';
  const BACKGROUND_SECONDARY = '#1F221C';
  const TEXT_PRIMARY = '#F5F3E7';
  const TEXT_SECONDARY = '#E8E3C5';
  const ACCENT_OLIVE = '#A6C36F';
  const BORDER_DIVIDER = '#3A3E36';
  const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
  // --------------------
  
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
    // Global Layout Rule: background/text/min-h-screen
    <div className={`min-h-screen bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}] font-inter`}>
      
      {/* Header */}
      {/* Using Background Secondary for the Header area for a slight lift */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] py-8 px-6 ${SHADOW_GLOW} border-b border-[${BORDER_DIVIDER}]/40`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-4xl font-bold mb-2 text-[${TEXT_PRIMARY}]`}>Treasurer Dashboard</h1>
              {/* Softer Text */}
              <p className={`text-[${TEXT_SECONDARY}]/70`}>Manage AuroraTreasury club finances</p>
            </div>
            
            {/* Navigation Buttons (Accent Olive Button Style) */}
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/treasurer/payment-requests')}
                // Button (Accent Olive) style adapted for white text variant
                className={`px-6 py-3 bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] rounded-2xl font-semibold hover:bg-[#8FAE5D] transition flex items-center shadow-lg`}
              >
                <ClipboardCheck className="w-5 h-5 mr-2" />
                Payment Requests
                {statistics?.pendingResubmissions > 0 && (
                  // Red Alert Badge
                  <span className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                    {statistics.pendingResubmissions}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => navigate('/treasurer/reimbursement-requests')}
                // Using a secondary color for Reimbursement, but keeping theme contrast
                className={`px-6 py-3 bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}] rounded-2xl font-semibold hover:bg-[#3A3E36] transition flex items-center shadow-lg border border-[${BORDER_DIVIDER}]/80`}
              >
                {/* Icon Tone: text-[#A6C36F]/80 */}
                <ReimburseIcon className={`w-5 h-5 mr-2 text-[${ACCENT_OLIVE}]/80`} />
                Reimbursement Requests
                {statistics?.reimbursementPending > 0 && (
                  // Accent Badge (Olive or a distinct secondary color)
                  <span className={`ml-2 px-2 py-1 bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] text-xs rounded-full`}>
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
            ACCENT_OLIVE={ACCENT_OLIVE}
            TEXT_PRIMARY={TEXT_PRIMARY}
            TEXT_SECONDARY={TEXT_SECONDARY}
            BORDER_DIVIDER={BORDER_DIVIDER}
            BACKGROUND_SECONDARY={BACKGROUND_SECONDARY}
          />

          <RectCard
            title="Total Wallet"
            value={`₹${walletBalance.toLocaleString('en-IN')}`}
            subtitle="Club funds"
            icon={Wallet}
            loading={statsLoading}
            ACCENT_OLIVE={ACCENT_OLIVE}
            TEXT_PRIMARY={TEXT_PRIMARY}
            TEXT_SECONDARY={TEXT_SECONDARY}
            BORDER_DIVIDER={BORDER_DIVIDER}
            BACKGROUND_SECONDARY={BACKGROUND_SECONDARY}
          />
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className={`flex space-x-2 border-b border-[${BORDER_DIVIDER}]`}>
            {/* Members Tab */}
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'members'
                  // Active Tab: Accent Olive border, Muted Olive background
                  ? `border-b-2 border-[${ACCENT_OLIVE}] text-[${ACCENT_OLIVE}] bg-[${BACKGROUND_SECONDARY}]/60`
                  // Inactive Tab: Softer Text, Hover Muted Olive
                  : `text-[${TEXT_SECONDARY}]/80 hover:text-[${TEXT_PRIMARY}] hover:bg-[${BACKGROUND_SECONDARY}]/30`
              }`}
            >
              📋 Members List by Month
            </button>
            {/* Wallet Tab */}
            <button
              onClick={() => setActiveTab('wallet')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'wallet'
                  ? `border-b-2 border-[${ACCENT_OLIVE}] text-[${ACCENT_OLIVE}] bg-[${BACKGROUND_SECONDARY}]/60`
                  : `text-[${TEXT_SECONDARY}]/80 hover:text-[${TEXT_PRIMARY}] hover:bg-[${BACKGROUND_SECONDARY}]/30`
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
const RectCard = ({ title, value, subtitle, icon: Icon, loading, ACCENT_OLIVE, TEXT_PRIMARY, TEXT_SECONDARY, BORDER_DIVIDER, BACKGROUND_SECONDARY }) => {
  if (loading) {
    return (
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-2xl p-6 shadow-[0_0_20px_rgba(166,195,111,0.08)] ring-1 ring-[${BORDER_DIVIDER}]/40 animate-pulse`}>
        <div className="h-6 bg-[#3A3E36]/50 rounded w-24 mb-4"></div>
        <div className="h-8 bg-[#3A3E36]/50 rounded w-32"></div>
      </div>
    );
  }

  return (
    // Card Container Style
    <div className={`bg-[${BACKGROUND_SECONDARY}] border border-[${BORDER_DIVIDER}]/40 rounded-2xl p-6 shadow-[0_0_20px_rgba(166,195,111,0.08)] hover:shadow-[0_0_25px_rgba(166,195,111,0.15)] transition-all duration-150`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {/* Icon Muted Background */}
          <div className={`p-2 bg-[${BORDER_DIVIDER}]/40 rounded-xl`}>
            {/* Icon Tone */}
            <Icon className={`w-6 h-6 text-[${ACCENT_OLIVE}]/80`} />
          </div>
          <div>
            {/* Soft Header Text */}
            <div className={`text-sm text-[${TEXT_SECONDARY}]`}>{title}</div>
            {/* Primary Number Display Style */}
            <div className={`text-3xl font-bold text-[${ACCENT_OLIVE}]`}>{value}</div>
          </div>
        </div>
      </div>
      {/* Muted Subtitle */}
      {subtitle && <div className={`text-xs text-[${TEXT_SECONDARY}]/60 mt-2`}>{subtitle}</div>}
    </div>
  );
};

// Removing unused StatCard to clean up, keeping RectCard logic

export default TreasurerDashboardNew;