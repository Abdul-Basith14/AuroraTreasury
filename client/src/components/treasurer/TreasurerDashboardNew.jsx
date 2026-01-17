import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { getStatistics, getWallet, setTreasurerUPI, getTreasurerUPISettings } from '../../utils/treasurerAPI';
import { Users, Wallet, Menu, LogOut, ClipboardCheck, FileText as ReimburseIcon } from 'lucide-react';
import WalletManagement from './WalletManagement';
import MembersListByMonth from './MembersListByMonth';
import CreateMonthlyRecord from './CreateMonthlyRecord';

/**
 * New Treasurer Dashboard
 * Simplified dashboard with wallet management and month-based member list
 */
const TreasurerDashboardNew = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [statistics, setStatistics] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('members'); // 'members', 'wallet', 'create-record'
  const [showMenu, setShowMenu] = useState(false);
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiInput, setUpiInput] = useState('');
  const [treasurerNameInput, setTreasurerNameInput] = useState('');
  const [upiHistory, setUpiHistory] = useState([]);
  const [upiLoading, setUpiLoading] = useState(false);
  const [savingUpi, setSavingUpi] = useState(false);
  
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

  const handleSetUpi = async () => {
    if (!upiInput.trim()) {
      toast.error('Enter a valid UPI ID');
      return;
    }
    try {
      setSavingUpi(true);
      const response = await setTreasurerUPI(upiInput.trim(), treasurerNameInput.trim());
      toast.success('Treasurer UPI saved');
      setUpiHistory(response.history || []);
      setShowUpiModal(false);
    } catch (error) {
      toast.error(error?.message || 'Failed to save UPI');
    } finally {
      setSavingUpi(false);
    }
  };
  
  const loadUpiSettings = async () => {
    try {
      setUpiLoading(true);
      const data = await getTreasurerUPISettings();
      setUpiInput(data.treasurerUPI || '');
      setTreasurerNameInput(data.treasurerName || '');
      setUpiHistory(data.history || []);
    } catch (error) {
      console.error('Error loading UPI settings:', error);
    } finally {
      setUpiLoading(false);
    }
  };

  useEffect(() => {
    if (showUpiModal) {
      loadUpiSettings();
    }
  }, [showUpiModal]);

  return (
    <div className="min-h-screen font-inter text-[#F5F3E7]">
      
      {/* Header */}
      <div className="bg-black/60 backdrop-blur-xl py-8 px-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border-b border-[#A6C36F]/20 relative z-30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between relative">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-[#F5F3E7]">Treasurer Dashboard</h1>
              <p className="text-[#E8E3C5]/70">Manage AuroraTreasury club finances</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setShowMenu((v) => !v)}
                  className="p-3 rounded-full bg-black/50 border border-[#A6C36F]/30 text-[#A6C36F] hover:bg-[#A6C36F]/10 transition"
                  aria-label="Open treasurer menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-black/90 border border-[#A6C36F]/30 rounded-xl shadow-[0_15px_40px_rgba(0,0,0,0.45)] z-50">
                    <div className="py-2">
                      <MenuItem label="🔍 Group Fund Verification" onClick={() => { setShowMenu(false); navigate('/treasurer/payment-requests'); }} icon={<ClipboardCheck className="w-4 h-4" />} />
                      <MenuItem label="💸 Reimbursement" onClick={() => { setShowMenu(false); navigate('/treasurer/reimbursement-requests'); }} icon={<ReimburseIcon className="w-4 h-4" />} />
                      <MenuItem label="🗓️ Create Monthly Records" onClick={() => { setShowMenu(false); setActiveTab('create-record'); }} icon={<Users className="w-4 h-4" />} />
                      <MenuItem label="🆔 Set UPI ID" onClick={() => { setShowMenu(false); setShowUpiModal(true); }} icon={<Wallet className="w-4 h-4" />} />
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="px-4 py-3 bg-black/40 text-[#F5F3E7] rounded-2xl font-semibold hover:bg-[#A6C36F]/10 transition flex items-center shadow-lg border border-[#A6C36F]/20 hover:border-[#A6C36F]/50"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
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
            {/* Member Tracking Tab */}
            <button
              onClick={() => setActiveTab('members')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'members'
                  ? 'border-b-2 border-[#A6C36F] text-[#A6C36F] bg-[#A6C36F]/10'
                  : 'text-[#E8E3C5]/60 hover:text-[#F5F3E7] hover:bg-[#A6C36F]/5'
              }`}
            >
              📋 Member Tracking
            </button>
            {/* Create Monthly Record Tab */}
            <button
              onClick={() => setActiveTab('create-record')}
              className={`px-6 py-3 font-medium text-sm transition-all duration-200 rounded-t-lg ${
                activeTab === 'create-record'
                  ? 'border-b-2 border-[#A6C36F] text-[#A6C36F] bg-[#A6C36F]/10'
                  : 'text-[#E8E3C5]/60 hover:text-[#F5F3E7] hover:bg-[#A6C36F]/5'
              }`}
            >
              📅 Create Monthly Record
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
        {activeTab === 'create-record' && <CreateMonthlyRecord />}
        {activeTab === 'wallet' && <WalletManagement />}
      </div>

      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-black/90 border border-[#A6C36F]/30 rounded-2xl max-w-2xl w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#F5F3E7] mb-1">Set Treasurer UPI</h3>
                <p className="text-sm text-[#E8E3C5]/70 mb-4">Used for QR payments and stored with treasurer name.</p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-[#E8E3C5]/70 block mb-1">Treasurer Name (shown in history)</label>
                    <input
                      type="text"
                      value={treasurerNameInput}
                      onChange={(e) => setTreasurerNameInput(e.target.value)}
                      placeholder="e.g., Alex Treasurer"
                      className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/30 rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/50 focus:border-[#A6C36F] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#E8E3C5]/70 block mb-1">Treasurer UPI ID</label>
                    <input
                      type="text"
                      value={upiInput}
                      onChange={(e) => setUpiInput(e.target.value)}
                      placeholder="e.g., treasurer@upi"
                      className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/30 rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/50 focus:border-[#A6C36F] focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => setShowUpiModal(false)}
                    className="flex-1 py-3 px-4 bg-[#1A1C17] text-[#E8E3C5]/80 rounded-xl border border-[#A6C36F]/20 hover:bg-[#2A2D24] transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetUpi}
                    disabled={savingUpi}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-black font-semibold rounded-xl hover:shadow-[0_0_20px_rgba(166,195,111,0.35)] transition disabled:opacity-60"
                  >
                    {savingUpi ? 'Saving...' : 'Save UPI'}
                  </button>
                </div>
              </div>
              <div className="w-64 bg-black/70 border border-[#A6C36F]/20 rounded-2xl p-4 max-h-[360px] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-[#F5F3E7]">Previous UPI entries</h4>
                  {upiLoading && <span className="text-xs text-[#A6C36F]">Loading...</span>}
                </div>
                {upiHistory.length === 0 && (
                  <p className="text-xs text-[#E8E3C5]/60">No history yet.</p>
                )}
                <div className="space-y-3">
                  {upiHistory.map((entry, idx) => (
                    <div key={`${entry.upiId}-${idx}`} className="p-3 rounded-xl bg-black/50 border border-[#A6C36F]/20">
                      <div className="text-[#F5F3E7] text-sm font-semibold">{entry.treasurerName || 'Treasurer'}</div>
                      <div className="text-[#A6C36F] text-sm break-all">{entry.upiId}</div>
                      {entry.setAt && (
                        <div className="text-[11px] text-[#E8E3C5]/60 mt-1">{new Date(entry.setAt).toLocaleString()}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuItem = ({ label, onClick, icon }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-3 text-left text-[#F5F3E7] hover:bg-[#A6C36F]/10 transition"
  >
    <span className="text-[#A6C36F]">{icon}</span>
    <span className="text-sm font-medium">{label}</span>
  </button>
);

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