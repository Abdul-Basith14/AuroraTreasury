import { useState, useEffect } from 'react';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { reimbursementAPI } from '../../utils/api';
import ReimbursementRequestModal from './ReimbursementRequestModal';
import ReimbursementRequestCard from './ReimbursementRequestCard';
import TreasurerResponseModal from './TreasurerResponseModal';
import ConfirmReceiptModal from './ConfirmReceiptModal';

/**
 * ReimbursementSection Component
 * Main container for all reimbursement-related functionality
 * * @param {Object} userData - Current user data
 */
const ReimbursementSection = ({ userData }) => {
  const [reimbursements, setReimbursements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmingReceipt, setConfirmingReceipt] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');

  // Fetch reimbursement requests on component mount
  useEffect(() => {
    fetchReimbursements();
  }, []);

  // Update month filter when reimbursements load
  useEffect(() => {
    if (reimbursements.length > 0) {
      const months = [...new Set(reimbursements.map(req => {
        const date = new Date(req.createdAt || req.date);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
      }))];
      
      // Auto-select the first available month (usually the most recent) if no filter is set
      // or if the current filter is no longer valid
      if (months.length > 0 && (!monthFilter || !months.includes(monthFilter))) {
        setMonthFilter(months[0]);
      }
    }
  }, [reimbursements, monthFilter]);

  // Clean up old rejected requests
  useEffect(() => {
    const cleanupRejectedRequests = async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const rejectedRequests = reimbursements.filter(r => 
        r.status === 'Rejected' && 
        new Date(r.updatedAt) < thirtyDaysAgo
      );

      for (const request of rejectedRequests) {
        await handleDelete(request._id, true);
      }
    };

    if (reimbursements.length > 0) {
      cleanupRejectedRequests();
    }
  }, [reimbursements]);

  /**
   * Fetch all reimbursement requests for the user
   */
  const fetchReimbursements = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      console.log('Fetching reimbursements from API...');
      const response = await reimbursementAPI.getMyRequests();
      console.log('API Response:', response);

      if (response && response.success) {
        console.log('Reimbursements data:', response.data);
        setReimbursements(response.data.reimbursements || []);
      } else {
        console.error('API response not successful:', response);
        toast.error(response?.message || 'Failed to load reimbursement requests');
      }
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(error?.message || 'Failed to load reimbursement requests');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle viewing treasurer's response
   */
  const handleViewResponse = (request) => {
    setSelectedRequest(request);
    setShowResponseModal(true);
  };

  /**
   * Handle confirming receipt of payment
   */
  const handleConfirmReceipt = async (requestId) => {
    setConfirmingReceipt(true);

    try {
      const response = await reimbursementAPI.confirmReceipt(requestId);

      if (response.success) {
        toast.success('Payment receipt confirmed! Thank you.');
        fetchReimbursements(false); // Refresh without full loader
        setShowConfirmModal(false);
        setShowResponseModal(false);
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      toast.error(error.message || 'Failed to confirm receipt. Please try again.');
    } finally {
      setConfirmingReceipt(false);
    }
  };

  /**
   * Handle opening confirm receipt modal
   */
  const handleOpenConfirmModal = (requestId) => {
    const request = reimbursements.find((r) => r._id === requestId);
    setSelectedRequest(request);
    setShowConfirmModal(true);
  };

  /**
   * Handle deleting a reimbursement request
   */
  const handleDelete = async (requestId, silent = false) => {
    const request = reimbursements.find(r => r._id === requestId);
    if (!request) return;

    // Show confirmation dialog if not silent
    if (!silent) {
      let message = 'Are you sure you want to delete this reimbursement request? This action cannot be undone.';
      
      if (request.status === 'Received' || request.status === 'Paid' || request.status === 'Approved') {
        message = 'This will remove the completed payment record from your list. The transaction record will still be maintained in the system. Continue?';
      }

      const confirmed = window.confirm(message);
      if (!confirmed) return;
    }

    try {
      const response = await reimbursementAPI.deleteRequest(requestId);

      if (response.success) {
        toast.success('Reimbursement request deleted successfully');
        fetchReimbursements(false); // Refresh without full loader
      }
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error(error.message || 'Failed to delete request. Please try again.');
    }
  };

  /**
   * Handle successful request submission
   */
  const handleRequestSuccess = () => {
    fetchReimbursements(false); // Refresh without full loader
  };

  /**
   * Loading Skeleton Component
   */
  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[1, 2].map((i) => (
        <div key={i} className="border border-[#A6C36F]/20 rounded-xl p-5 animate-pulse bg-black/40">
          <div className="flex justify-between mb-4">
            <div className="h-6 bg-[#A6C36F]/20 rounded w-20"></div>
            <div className="h-4 bg-[#A6C36F]/20 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-[#A6C36F]/20 rounded w-32"></div>
            <div className="h-4 bg-[#A6C36F]/20 rounded w-full"></div>
            <div className="h-4 bg-[#A6C36F]/20 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );

  /**
   * Empty State Component
   */
  const EmptyState = () => (
    <div className="text-center py-16">
      <Receipt className="w-20 h-20 text-[#A6C36F] mx-auto mb-4 opacity-80" />
      <h3 className="text-xl font-semibold text-[#F5F3E7] mb-2">No Reimbursement Requests Yet</h3>
      <p className="text-[#E8E3C5]/60 mb-6 max-w-md mx-auto">
        Made a purchase for the club? Request your money back by submitting a reimbursement request with your bill proof!
      </p>
      <button
        onClick={() => setShowRequestModal(true)}
        className="px-6 py-3 bg-[#A6C36F] text-black rounded-lg hover:bg-[#8FAE5D] font-semibold inline-flex items-center transition shadow-[0_0_15px_rgba(166,195,111,0.3)] hover:shadow-[0_0_25px_rgba(166,195,111,0.5)]"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Request
      </button>
    </div>
  );

  /**
   * Derive available months from requests for the dropdown
   */
  const availableMonths = [...new Set(reimbursements.map(req => {
    const date = new Date(req.createdAt || req.date); // Fallback to date if createdAt missing
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  }))];

  /**
   * Filter requests based on selected month and completion status
   */
  const filteredRequests = reimbursements.filter(request => {
    // 1. Month Filter
    if (monthFilter) {
      const date = new Date(request.createdAt || request.date);
      const requestMonth = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (requestMonth !== monthFilter) return false;
    }
    
    // 2. Hide Completed Filter
    if (hideCompleted && ['Received'].includes(request.status)) {
      return false;
    }

    return true;
  });

  return (
    <div className="mt-8 mb-8 bg-black/60 backdrop-blur-xl rounded-2xl border border-[#A6C36F]/20 shadow-xl overflow-hidden">
      
      {/* Header Section */}
      <div className="bg-black/40 rounded-t-2xl p-6 border-b border-[#A6C36F]/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center text-[#F5F3E7]">
              <span className="text-[#A6C36F] mr-2">💰</span> Reimbursement Requests
            </h2>
            <p className="text-sm text-[#E8E3C5]/60">
              Request money back for club-related purchases
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={() => fetchReimbursements(false)}
              disabled={refreshing}
              className="p-2 bg-black/40 hover:bg-[#A6C36F]/10 rounded-lg transition disabled:opacity-50 text-[#A6C36F] border border-[#A6C36F]/20 hover:border-[#A6C36F]/50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* New Request Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-[#A6C36F] text-black px-4 py-2 rounded-lg font-semibold hover:bg-[#8FAE5D] transition shadow-md flex items-center hover:shadow-[0_0_15px_rgba(166,195,111,0.4)]"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">New Request</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && reimbursements.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Requests */}
            <div className="bg-black/40 rounded-lg p-3 border-l-4 border-[#E8E3C5]/20">
              <p className="text-xs text-[#E8E3C5]/60 font-medium uppercase tracking-wider">Total Requests</p>
              <p className="text-2xl font-bold text-[#F5F3E7]">{reimbursements.length}</p>
            </div>
            {/* Pending */}
            <div className="bg-black/40 rounded-lg p-3 border-l-4 border-yellow-500">
              <p className="text-xs text-[#E8E3C5]/60 font-medium uppercase tracking-wider">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">
                {reimbursements.filter((r) => r.status === 'Pending').length}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-4 mt-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hideCompleted"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded text-[#A6C36F] focus:ring-[#A6C36F] bg-black/40 border-[#A6C36F]/30"
                />
                <label htmlFor="hideCompleted" className="text-sm text-[#E8E3C5]/80 cursor-pointer select-none">
                  Hide completed requests
                </label>
              </div>

              {/* Month Dropdown */}
              <select
                value={monthFilter}
                onChange={(e) => setMonthFilter(e.target.value)}
                className="bg-[#0B0B09] text-[#F5F3E7] text-sm border border-[#3A3E36] rounded-lg px-3 py-2 focus:ring-1 focus:ring-[#A6C36F] focus:border-[#A6C36F] outline-none cursor-pointer hover:border-[#A6C36F]/50 transition-colors"
              >
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            {filteredRequests.length > 0 ? (
              filteredRequests.map((request) => (
                request && request._id ? (
                  <ReimbursementRequestCard
                    key={request._id}
                    request={request}
                    onViewResponse={handleViewResponse}
                    onConfirmReceipt={handleOpenConfirmModal}
                    onDelete={handleDelete}
                  />
                ) : null
              ))
            ) : (
              <div className="text-center py-12 text-[#E8E3C5]/60 border border-dashed border-[#A6C36F]/20 rounded-xl bg-black/20">
                <p>No requests found for this period.</p>
              </div>
            )}
          </div>
      </div>

      {/* Modals */}
      <ReimbursementRequestModal
        isOpen={showRequestModal}
        onClose={() => setShowRequestModal(false)}
        userData={userData}
        onSuccess={handleRequestSuccess}
      />

      <TreasurerResponseModal
        isOpen={showResponseModal}
        onClose={() => {
          setShowResponseModal(false);
          setSelectedRequest(null);
        }}
        request={selectedRequest}
        onConfirmReceipt={handleOpenConfirmModal}
      />

      <ConfirmReceiptModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setSelectedRequest(null);
        }}
        onConfirm={handleConfirmReceipt}
        request={selectedRequest}
        loading={confirmingReceipt}
      />
    </div>
  );
};

export default ReimbursementSection;