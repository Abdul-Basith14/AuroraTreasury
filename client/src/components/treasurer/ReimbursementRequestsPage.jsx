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
  Wallet as WalletIcon
} from 'lucide-react';
import ReimbursementRequestCard from './ReimbursementRequestCard';
import PayReimbursementModal from './PayReimbursementModal';
import RejectReimbursementModal from './RejectReimbursementModal';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

const ReimbursementRequestsPage = () => {
  const navigate = useNavigate();
  
  const [requests, setRequests] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [walletLoading, setWalletLoading] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('pending');
  const [yearFilter, setYearFilter] = useState('all');
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
  const paidCount = requests.filter(r => r.status === 'Paid').length;
  const receivedCount = requests.filter(r => r.status === 'Received').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected').length;
  
  return (
    // Main Background
    <div className={`min-h-screen bg-[${BACKGROUND_PRIMARY}]`}>
      {/* Header - Use Accent Olive for the gradient/main color */}
      <div className={`bg-gradient-to-r from-[#6E8D42] to-[${ACCENT_OLIVE}] text-white py-6 px-6 shadow-xl`}>
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/treasurer-dashboard')}
            className={`flex items-center text-[${TEXT_SECONDARY}] hover:text-white mb-4 transition`}
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-[${TEXT_PRIMARY}]">
                Reimbursement Requests
              </h1>
              <p className={`text-[${TEXT_SECONDARY}]/90 mt-2`}>
                Review and process member reimbursement requests
              </p>
            </div>
            
            {/* Wallet - Themed Wallet Panel */}
            <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl p-4 min-w-[280px] border border-[${BORDER_DIVIDER}]`}>
              <p className={`text-xs text-[${TEXT_SECONDARY}]/70 mb-1 flex items-center`}>
                <WalletIcon className="w-4 h-4 mr-1 text-blue-400" /> Total Reimbursed
              </p>
              {walletLoading ? (
                <div className={`h-8 w-32 bg-[${BORDER_DIVIDER}] rounded animate-pulse`}></div>
              ) : (
                <div className={`text-3xl font-bold flex items-center text-[${ACCENT_OLIVE}]`}>
                  <CurrencyRupeeIcon className="w-8 h-8 mr-1" />
                  {wallet?.totalReimbursed || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters & Search - Themed Filter Panel */}
        <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl shadow-md p-6 mb-6 border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
          <div className="flex justify-between items-center mb-4 border-b border-[${BORDER_DIVIDER}]/50 pb-4">
            <h2 className={`text-lg font-bold text-[${TEXT_PRIMARY}]`}>Filters</h2>
            {/* Refresh Button - Themed */}
            <button
              onClick={handleRefresh}
              className={`flex items-center px-4 py-2 text-sm bg-[${BORDER_DIVIDER}]/50 text-[${ACCENT_OLIVE}] rounded-lg hover:bg-[${BORDER_DIVIDER}] transition`}
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>Status</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', count: requests.length },
                  { value: 'pending', label: 'Pending', count: pendingCount },
                  { value: 'paid', label: 'Paid', count: paidCount },
                  { value: 'received', label: 'Received', count: receivedCount },
                  { value: 'rejected', label: 'Rejected', count: rejectedCount }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => setStatusFilter(status.value)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                      statusFilter === status.value
                        // Active: Olive Accent
                        ? `bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}]` 
                        // Inactive: Darker background, Primary Text
                        : `bg-[${BORDER_DIVIDER}]/50 text-[${TEXT_PRIMARY}] hover:bg-[${BORDER_DIVIDER}]`
                    }`}
                  >
                    {status.label} ({status.count})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Year Filter */}
            <div>
              <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>Member Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                // Themed Select
                className={`w-full px-4 py-2 border border-[${BORDER_DIVIDER}] bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}] rounded-lg focus:ring-2 focus:ring-[${ACCENT_OLIVE}]/50 focus:border-[${ACCENT_OLIVE}]/50`}
              >
                <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="all">All Years</option>
                <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="1st Year">1st Year</option>
                <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="2nd Year">2nd Year</option>
                <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="3rd Year">3rd Year</option>
                <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="4th Year">4th Year</option>
              </select>
            </div>
            
            {/* Search */}
            <div>
              <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>Search</label>
              <div className="relative">
                <SearchIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${TEXT_SECONDARY}]/60`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, USN, description..."
                  // Themed Input
                  className={`w-full pl-10 pr-4 py-2 border border-[${BORDER_DIVIDER}] bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}] rounded-lg focus:ring-2 focus:ring-[${ACCENT_OLIVE}]/50 focus:border-[${ACCENT_OLIVE}]/50 placeholder-[${TEXT_SECONDARY}]/40`}
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Requests List */}
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : requests.length === 0 ? (
          // Empty State - Themed
          <div className={`text-center py-16 bg-[${BACKGROUND_SECONDARY}] rounded-xl shadow-md border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
            <div className={`w-20 h-20 bg-[${BORDER_DIVIDER}] rounded-full flex items-center justify-center mx-auto mb-4`}>
              <CurrencyRupeeIcon className={`w-10 h-10 text-[${TEXT_SECONDARY}]/40`} />
            </div>
            <h3 className={`text-xl font-semibold text-[${TEXT_PRIMARY}] mb-2`}>No Requests Found</h3>
            <p className={`text-[${TEXT_SECONDARY}]/70`}>
              {statusFilter !== 'all' 
                ? `No ${statusFilter} reimbursement requests`
                : 'No reimbursement requests yet'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className={`text-sm text-[${TEXT_SECONDARY}]/80`}>
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </p>
              {statusFilter === 'pending' && pendingCount > 0 && (
                <p className="text-sm text-yellow-400 font-medium">
                  ⚠️ {pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting your action
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ReimbursementRequestCard is already themed */}
              {requests.map(request => (
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
      
      {/* Modals (Already Themed or next in queue) */}
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

// Themed Skeleton Card
const SkeletonCard = () => (
  <div className={`border border-[${BORDER_DIVIDER}]/50 rounded-2xl p-6 animate-pulse bg-[${BACKGROUND_SECONDARY}]`}>
    <div className="flex items-center space-x-3 mb-4">
      <div className={`w-12 h-12 bg-[${BORDER_DIVIDER}] rounded-full`}></div>
      <div className="flex-1">
        <div className={`h-4 bg-[${BORDER_DIVIDER}] rounded w-32 mb-2`}></div>
        <div className={`h-3 bg-[${BORDER_DIVIDER}] rounded w-24`}></div>
      </div>
    </div>
    <div className={`h-32 bg-[${BORDER_DIVIDER}] rounded-xl mb-4`}></div>
    <div className="flex space-x-2">
      <div className={`h-10 bg-[${BORDER_DIVIDER}] rounded-xl flex-1`}></div>
      <div className={`h-10 bg-[${BORDER_DIVIDER}] rounded-xl flex-1`}></div>
    </div>
  </div>
);

export default ReimbursementRequestsPage;