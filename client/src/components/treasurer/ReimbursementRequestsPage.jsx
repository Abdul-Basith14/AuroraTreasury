import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  getReimbursementRequests,
  getTreasurerWallet 
} from '../../utils/treasurerAPI';
import { 
  ArrowLeft as ArrowLeftIcon,
  IndianRupee as CurrencyRupeeIcon,
  Search as SearchIcon,
  RefreshCw as RefreshIcon,
  Wallet as WalletIcon,
  TrendingUp,
  Filter,
  Sparkles
} from 'lucide-react';
import ReimbursementRequestCard from './ReimbursementRequestCard';
import PayReimbursementModal from './PayReimbursementModal';
import RejectReimbursementModal from './RejectReimbursementModal';

const ReimbursementRequestsPage = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [yearFilter, setYearFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  useEffect(() => {
    fetchRequests();
    fetchWallet();
  }, [statusFilter, yearFilter, searchQuery]);
  
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const data = await getReimbursementRequests({
        status: statusFilter,
        year: yearFilter,
        search: searchQuery
      });
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load reimbursement requests');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchWallet = async () => {
    setWalletLoading(true);
    try {
      const data = await getTreasurerWallet();
      setWallet(data.wallet);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    } finally {
      setWalletLoading(false);
    }
  };
  
  const handlePayClick = (request) => {
    setSelectedRequest(request);
    setShowPayModal(true);
  };
  
  const handleRejectClick = (request) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
  };
  
  const handlePaySuccess = () => {
    setShowPayModal(false);
    setSelectedRequest(null);
    fetchRequests();
    fetchWallet(); // Refresh wallet
    toast.success('Payment proof uploaded! Awaiting member confirmation.');
  };
  
  const handleRejectSuccess = () => {
    setShowRejectModal(false);
    setSelectedRequest(null);
    fetchRequests();
    toast.success('Reimbursement request rejected');
  };
  
  const handleRefresh = () => {
    fetchRequests();
    fetchWallet();
    toast.success('Refreshed!');
  };
  
  // Group requests by status for counts
  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  // Derive available months from requests for the dropdown
  const availableMonths = React.useMemo(() => {
    const months = new Set();
    requests.forEach(req => {
      const date = new Date(req.requestDate || req.createdAt);
      months.add(date.toLocaleString('default', { month: 'long', year: 'numeric' }));
    });
    return Array.from(months);
  }, [requests]);

  // Filter requests based on selected month (in addition to existing backend filters)
  const displayedRequests = React.useMemo(() => {
    if (monthFilter === 'all') return requests;
    return requests.filter(req => {
      const date = new Date(req.requestDate || req.createdAt);
      const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      return monthYear === monthFilter;
    });
  }, [requests, monthFilter]);
  
  return (
    <div className="min-h-screen bg-[#0B0B09] text-[#F5F3E7] font-inter relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#A6C36F]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#8FAE5D]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Enhanced Header - Reverted to solid black theme */}
      <div className="relative bg-black border-b border-[#A6C36F]/20 sticky top-0 z-40 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-6 w-full md:w-auto">
              <button
                onClick={() => navigate('/treasurer-dashboard')}
                className="group p-3 rounded-xl bg-[#0B0B09] border border-[#3A3E36] hover:border-[#A6C36F] text-[#F5F3E7] hover:text-[#A6C36F] transition-all duration-300 shadow-lg hover:shadow-[#A6C36F]/20"
              >
                <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              </button>
              <div>
                <h1 className="text-3xl font-black text-[#F5F3E7] flex items-center gap-3">
                  Reimbursements
                  <Sparkles className="w-6 h-6 text-[#A6C36F] animate-pulse" />
                </h1>
                <p className="text-sm text-[#E8E3C5]/60 mt-1 font-medium">Manage and process reimbursement requests</p>
              </div>
            </div>
            
            {/* Enhanced Wallet Stats - Black theme */}
            <div className="relative group">
              <div className="absolute inset-0 bg-[#A6C36F]/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
              <div className="relative flex items-center bg-[#0B0B09] rounded-2xl px-6 py-4 border border-[#A6C36F]/30 shadow-xl">
                <div className="p-3 bg-black rounded-xl mr-4 border border-[#A6C36F]/30">
                  <WalletIcon className="w-6 h-6 text-[#A6C36F]" />
                </div>
                <div>
                  <p className="text-xs text-[#E8E3C5]/50 uppercase tracking-widest font-semibold mb-1 flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Total Reimbursed
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-black text-[#A6C36F]">₹</span>
                    <span className="text-2xl font-black text-[#F5F3E7]">
                      {wallet?.totalReimbursed || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters Bar - Solid colors */}
          <div className="mt-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            {/* Search with icon animation */}
            <div className="relative flex-grow group/search">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/60 group-focus-within/search:text-[#A6C36F] transition-colors duration-300" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, USN, description..."
                className="w-full pl-12 pr-4 py-3 bg-[#0B0B09] border border-[#3A3E36] rounded-xl text-sm text-[#F5F3E7] focus:ring-1 focus:ring-[#A6C36F] focus:border-[#A6C36F] outline-none placeholder-[#E8E3C5]/30 transition-all duration-300 shadow-inner"
              />
            </div>

            {/* Status Tabs with enhanced styling */}
            <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {[
                { value: 'all', label: 'All', icon: Filter },
                { value: 'pending', label: 'Pending', icon: null },
                { value: 'paid', label: 'Paid', icon: null },
                { value: 'rejected', label: 'Rejected', icon: null }
              ].map(status => (
                <button
                  key={status.value}
                  onClick={() => setStatusFilter(status.value)}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                    statusFilter === status.value
                      ? 'bg-[#A6C36F] text-black border-[#A6C36F] shadow-lg shadow-[#A6C36F]/20 scale-105' 
                      : 'bg-[#0B0B09] text-[#E8E3C5]/70 hover:bg-[#1A1A1A] hover:text-[#F5F3E7] border-[#3A3E36] hover:border-[#A6C36F]/50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {status.icon && <status.icon className="w-3.5 h-3.5" />}
                    {status.label}
                    {status.value === 'pending' && pendingCount > 0 && (
                      <span className="ml-1 px-2 py-0.5 bg-red-600 text-white text-[10px] rounded-full font-black animate-pulse">
                        {pendingCount}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>

            {/* Month Select */}
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="px-4 py-3 bg-[#0B0B09] border border-[#3A3E36] rounded-xl text-sm text-[#F5F3E7] focus:ring-1 focus:ring-[#A6C36F] outline-none cursor-pointer hover:border-[#A6C36F]/50 transition-all duration-300 font-medium"
            >
              <option value="all">All Months</option>
              {availableMonths.map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            {/* Year Select with enhanced styling */}
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-3 bg-[#0B0B09] border border-[#3A3E36] rounded-xl text-sm text-[#F5F3E7] focus:ring-1 focus:ring-[#A6C36F] outline-none cursor-pointer hover:border-[#A6C36F]/50 transition-all duration-300 font-medium"
            >
              <option value="all">All Years</option>
              <option value="1st Year">1st Year</option>
              <option value="2nd Year">2nd Year</option>
              <option value="3rd Year">3rd Year</option>
              <option value="4th Year">4th Year</option>
            </select>

            <button
              onClick={handleRefresh}
              className="group p-3 bg-[#0B0B09] border border-[#3A3E36] rounded-xl text-[#A6C36F] hover:bg-[#A6C36F]/10 hover:border-[#A6C36F]/50 transition-all duration-300 shadow-lg hover:shadow-[#A6C36F]/20"
              title="Refresh"
            >
              <RefreshIcon className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <EnhancedSkeletonCard key={i} />)}
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-[#A6C36F]/20 rounded-full blur-3xl animate-pulse" />
              <div className="relative w-24 h-24 bg-[#0B0B09] rounded-full flex items-center justify-center border-4 border-[#A6C36F]/30 shadow-xl">
                <CurrencyRupeeIcon className="w-12 h-12 text-[#A6C36F]/40" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-[#F5F3E7] mb-2">No Requests Found</h3>
            <p className="text-[#E8E3C5]/60 text-center max-w-md">
              {statusFilter !== 'all' || monthFilter !== 'all'
                ? `No reimbursement requests match your filters`
                : 'No reimbursement requests have been submitted yet'
              }
            </p>
          </div>
        ) : (
          <>
            {/* Results count with enhanced styling */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-sm text-[#E8E3C5]/70 font-medium">
                Showing <span className="text-[#A6C36F] font-bold">{displayedRequests.length}</span> request{displayedRequests.length !== 1 ? 's' : ''}
              </p>
              {statusFilter === 'pending' && pendingCount > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  <p className="text-sm text-yellow-400 font-semibold">
                    {pendingCount} awaiting action
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedRequests.map(request => (
                <ReimbursementRequestCard
                  key={request._id}
                  request={request}
                  onPay={handlePayClick}
                  onReject={handleRejectClick}
                />
              ))}
            </div>
          </>
        )}
      </div>
      
      {/* Modals */}
      <PayReimbursementModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        request={selectedRequest}
        onSuccess={handlePaySuccess}
        currentBalance={wallet?.currentBalance || 0}
      />
      
      <RejectReimbursementModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        request={selectedRequest}
        onSuccess={handleRejectSuccess}
      />
    </div>
  );
};

const EnhancedSkeletonCard = () => (
  <div className="relative bg-[#0B0B09] rounded-2xl p-5 border border-[#3A3E36] animate-pulse overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#A6C36F]/5 to-transparent -translate-x-full animate-shimmer" />
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-[#3A3E36] rounded-full" />
      <div className="flex-1">
        <div className="h-4 bg-[#3A3E36] rounded w-24 mb-2" />
        <div className="h-3 bg-[#3A3E36] rounded w-16" />
      </div>
    </div>
    <div className="h-24 bg-[#3A3E36] rounded-xl mb-4" />
    <div className="h-16 bg-[#3A3E36] rounded-lg mb-4" />
    <div className="flex space-x-2">
      <div className="h-10 bg-[#3A3E36] rounded-lg flex-1" />
      <div className="h-10 bg-[#3A3E36] rounded-lg flex-1" />
    </div>
  </div>
);

export default ReimbursementRequestsPage;