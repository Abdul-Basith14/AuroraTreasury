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
 * Displays all reimbursement requests and handles CRUD operations
 * 
 * @param {Object} userData - Current user data
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

  // Fetch reimbursement requests on component mount
  useEffect(() => {
    fetchReimbursements();
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
  const handleDelete = async (requestId) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Are you sure you want to delete this reimbursement request? This action cannot be undone.'
    );

    if (!confirmed) return;

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
        <div key={i} className="border-2 border-gray-200 rounded-xl p-5 animate-pulse">
          <div className="flex justify-between mb-4">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
      <Receipt className="w-20 h-20 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reimbursement Requests Yet</h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        Made a purchase for the club? Request your money back by submitting a reimbursement request with your bill proof!
      </p>
      <button
        onClick={() => setShowRequestModal(true)}
        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold inline-flex items-center transition shadow-md hover:shadow-lg"
      >
        <Plus className="w-5 h-5 mr-2" />
        Create Your First Request
      </button>
    </div>
  );

  return (
    <div className="mt-8 mb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center">
              💰 Reimbursement Requests
            </h2>
            <p className="text-white text-opacity-90">
              Request money back for club-related purchases
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Refresh Button */}
            <button
              onClick={() => fetchReimbursements(false)}
              disabled={refreshing}
              className="p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* New Request Button */}
            <button
              onClick={() => setShowRequestModal(true)}
              className="bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md hover:shadow-lg flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              New Request
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && reimbursements.length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-white text-opacity-80 font-medium">Total Requests</p>
              <p className="text-2xl font-bold">{reimbursements.length}</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-white text-opacity-80 font-medium">Pending</p>
              <p className="text-2xl font-bold">
                {reimbursements.filter((r) => r.status === 'Pending').length}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-white text-opacity-80 font-medium">Approved</p>
              <p className="text-2xl font-bold">
                {reimbursements.filter((r) => r.status === 'Approved' || r.status === 'Paid').length}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-3 backdrop-blur-sm">
              <p className="text-xs text-white text-opacity-80 font-medium">Received</p>
              <p className="text-2xl font-bold">
                {reimbursements.filter((r) => r.status === 'Received').length}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-b-2xl shadow-lg p-6">
        {loading ? (
          <LoadingSkeleton />
        ) : reimbursements.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {reimbursements.map((request) => (
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
