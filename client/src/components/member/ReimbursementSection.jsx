import { useState, useEffect } from 'react';
import { Receipt, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { reimbursementAPI } from '../../utils/api';
import ReimbursementRequestModal from './ReimbursementRequestModal';
import ReimbursementRequestCard from './ReimbursementRequestCard';
import TreasurerResponseModal from './TreasurerResponseModal';
import ConfirmReceiptModal from './ConfirmReceiptModal';

// --- Theme Colors ---
const PRIMARY_BG = '#1F221C'; // Dark background (List BG)
const HEADER_BG = '#2A2E28'; // Lighter Dark Background (Header BG)
const CARD_BG = '#0B0B09'; // Deep Black (Used for contrast elements)
const ACCENT_OLIVE = '#A6C36F'; // Primary accent color
const ACCENT_HOVER = '#8FAE5D';
const TEXT_LIGHT = '#E8E3C5'; // Light text for dark background
const TEXT_MUTED = '#9CA3AF'; // Muted Light Text
const TEXT_DARK = '#0B0B09'; // Dark text for olive accent
const BORDER_DARK = '#3A3E36'; // Dark border/divider

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

  // Fetch reimbursement requests on component mount
  useEffect(() => {
    fetchReimbursements();

    // Auto-cleanup old rejected requests after 30 days
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

    cleanupRejectedRequests();
  }, []);

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

      const response = await reimbursementAPI.getMyRequests();

      if (response.success) {
        setReimbursements(response.data.reimbursements || []);
      }
    } catch (error) {
      console.error('Error fetching reimbursements:', error);
      toast.error('Failed to load reimbursement requests');
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
        // Changed colors to dark theme neutrals
        <div key={i} className={`border-2 border-[${BORDER_DARK}] rounded-xl p-5 animate-pulse bg-[${CARD_BG}]`}>
          <div className="flex justify-between mb-4">
            <div className={`h-6 bg-[${BORDER_DARK}] rounded w-20`}></div>
            <div className={`h-4 bg-[${BORDER_DARK}] rounded w-24`}></div>
          </div>
          <div className="space-y-3">
            <div className={`h-8 bg-[${BORDER_DARK}] rounded w-32`}></div>
            <div className={`h-4 bg-[${BORDER_DARK}] rounded w-full`}></div>
            <div className={`h-4 bg-[${BORDER_DARK}] rounded w-3/4`}></div>
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
      <Receipt className={`w-20 h-20 text-[${ACCENT_OLIVE}] mx-auto mb-4`} />
      <h3 className={`text-xl font-semibold text-[${TEXT_LIGHT}] mb-2`}>No Reimbursement Requests Yet</h3>
      <p className={`text-[${TEXT_LIGHT}] text-opacity-80 mb-6 max-w-md mx-auto`}>
        Made a purchase for the club? Request your money back by submitting a reimbursement request with your bill proof!
      </p>
      <button
        onClick={() => setShowRequestModal(true)}
        className={`px-6 py-3 bg-[${ACCENT_OLIVE}] text-[${TEXT_DARK}] rounded-lg hover:bg-[${ACCENT_HOVER}] font-semibold inline-flex items-center transition shadow-md hover:shadow-lg`}
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Request
      </button>
    </div>
  );

  return (
    // Main Wrapper uses a lighter dark background to stand out from the dashboard BG
    <div className={`mt-8 mb-8 bg-[${HEADER_BG}] rounded-2xl border border-[${BORDER_DARK}] shadow-xl overflow-hidden`}>
      
      {/* Header Section: Now dark-themed with light text */}
      <div className={`bg-[${HEADER_BG}] rounded-t-2xl p-6 text-[${TEXT_LIGHT}] border-b border-[${BORDER_DARK}]`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-2xl font-bold mb-2 flex items-center text-[${TEXT_LIGHT}]`}>
              {/* Use Olive Accent for the icon */}
              <span className={`text-[${ACCENT_OLIVE}] mr-2`}>💰</span> Reimbursement Requests
            </h2>
            {/* Use muted light text for description */}
            <p className={`text-sm text-[${TEXT_MUTED}]`}>
              Request money back for club-related purchases
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Refresh Button - Styled for contrast against HEADER_BG */}
            <button
              onClick={() => fetchReimbursements(false)}
              disabled={refreshing}
              // Dark background for button, olive icon color
              className={`p-2 bg-[${PRIMARY_BG}] hover:bg-[#3A3E36] rounded-lg transition disabled:opacity-50 text-[${ACCENT_OLIVE}] border border-[${BORDER_DARK}]`}
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* New Request Button - Primary Accent Style (Olive) */}
            <button
              onClick={() => setShowRequestModal(true)}
              // Olive background, black text
              className={`bg-[${ACCENT_OLIVE}] text-[${TEXT_DARK}] px-4 py-2 rounded-lg font-semibold hover:bg-[${ACCENT_HOVER}] transition shadow-md flex items-center`}
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">New Request</span>
            </button>
          </div>
        </div>

        {/* Summary Stats: Now dark boxes with light text and color-coded borders */}
        {!loading && reimbursements.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Requests */}
            <div className={`bg-[${PRIMARY_BG}] rounded-lg p-3 border-l-4 border-white/10`}>
              <p className={`text-xs text-[${TEXT_MUTED}] font-medium uppercase tracking-wider`}>Total Requests</p>
              <p className={`text-2xl font-bold text-[${TEXT_LIGHT}]`}>{reimbursements.length}</p>
            </div>
            {/* Pending */}
            <div className={`bg-[${PRIMARY_BG}] rounded-lg p-3 border-l-4 border-yellow-500`}>
              <p className={`text-xs text-[${TEXT_MUTED}] font-medium uppercase tracking-wider`}>Pending</p>
              <p className={`text-2xl font-bold text-yellow-400`}>
                {reimbursements.filter((r) => r.status === 'Pending').length}
              </p>
            </div>
            {/* Approved/Paid */}
            <div className={`bg-[${PRIMARY_BG}] rounded-lg p-3 border-l-4 border-blue-400`}>
              <p className={`text-xs text-[${TEXT_MUTED}] font-medium uppercase tracking-wider`}>Approved</p>
              <p className={`text-2xl font-bold text-blue-400`}>
                {reimbursements.filter((r) => r.status === 'Approved' || r.status === 'Paid').length}
              </p>
            </div>
            {/* Rejected (Using Red Accent) */}
            <div className={`bg-[${PRIMARY_BG}] rounded-lg p-3 border-l-4 border-red-500`}>
              <p className={`text-xs text-[${TEXT_MUTED}] font-medium uppercase tracking-wider`}>Rejected</p>
              <p className={`text-2xl font-bold text-red-500`}>
                {reimbursements.filter((r) => r.status === 'Rejected').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Requests List Section: Uses the darker PRIMARY_BG for list items to contrast slightly */}
      <div className={`bg-[${PRIMARY_BG}] rounded-b-2xl p-6`}>
        {loading ? (
          <LoadingSkeleton />
        ) : reimbursements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hideCompleted"
                  checked={hideCompleted}
                  onChange={(e) => setHideCompleted(e.target.checked)}
                  className="rounded text-[#A6C36F] focus:ring-[#A6C36F]"
                />
                <label htmlFor="hideCompleted" className="text-sm text-[#E8E3C5]">
                  Hide completed requests
                </label>
              </div>
            </div>
            {reimbursements
              .filter(request => !hideCompleted || !['Received'].includes(request.status))
              .map((request) => (
                <ReimbursementRequestCard
                  key={request._id}
                  request={request}
                  onViewResponse={handleViewResponse}
                  onConfirmReceipt={handleOpenConfirmModal}
                  onDelete={handleDelete}
                />
            ))}
          </div>
        )}
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