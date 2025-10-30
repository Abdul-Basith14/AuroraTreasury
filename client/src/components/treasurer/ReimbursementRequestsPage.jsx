
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
  RefreshCw as RefreshIcon
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate('/treasurer-dashboard')}
            className="flex items-center text-white hover:text-purple-100 mb-4 transition"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Dashboard
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Reimbursement Requests</h1>
              <p className="text-purple-100 mt-2">Review and process member reimbursement requests</p>
            </div>
            
            {/* Wallet - show only total reimbursed (confirmed) */}
            <div className="bg-white bg-opacity-20 backdrop-blur rounded-xl p-4 min-w-[280px]">
              <p className="text-xs text-purple-100 mb-1">� Total Reimbursed</p>
              {walletLoading ? (
                <div className="h-8 w-32 bg-white bg-opacity-20 rounded animate-pulse"></div>
              ) : (
                <div className="text-3xl font-bold flex items-center">
                  <CurrencyRupeeIcon className="w-8 h-8 mr-1" />
                  {wallet?.totalReimbursed || 0}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
            >
              <RefreshIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
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
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      statusFilter === status.value
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {status.label} ({status.count})
                  </button>
                ))}
              </div>
            </div>
            
            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Member Year</label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Name, USN, description..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
          <div className="text-center py-16 bg-white rounded-xl shadow-md">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CurrencyRupeeIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-500">
              {statusFilter !== 'all' 
                ? `No ${statusFilter} reimbursement requests`
                : 'No reimbursement requests yet'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                Showing {requests.length} request{requests.length !== 1 ? 's' : ''}
              </p>
              {statusFilter === 'pending' && pendingCount > 0 && (
                <p className="text-sm text-yellow-700 font-medium">
                  ⚠️ {pendingCount} request{pendingCount !== 1 ? 's' : ''} awaiting your action
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

const SkeletonCard = () => (
  <div className="border border-gray-200 rounded-lg p-6 animate-pulse bg-white">
    <div className="flex items-center space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="h-32 bg-gray-200 rounded mb-4"></div>
    <div className="flex space-x-2">
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
      <div className="h-10 bg-gray-200 rounded flex-1"></div>
    </div>
  </div>
);

export default ReimbursementRequestsPage;