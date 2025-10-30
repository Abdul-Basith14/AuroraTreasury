import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { rejectPayment, rejectResubmission } from '../../utils/treasurerAPI';
import { XCircle, X } from 'lucide-react';

/**
 * Reject Payment Modal - Modal for rejecting payment with reason
 */
const RejectPaymentModal = ({ request, isResubmission, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle rejection
  const handleReject = async () => {
    if (!reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      
      const rejectFunction = isResubmission ? rejectResubmission : rejectPayment;
      const data = await rejectFunction(request._id, reason.trim());
      
      if (data.success) {
        toast.success(data.message || 'Payment rejected successfully');
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to reject payment');
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Reject Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <p className="text-gray-700">
            Please provide a reason for rejecting this payment request.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Member:</span>
              <span className="text-sm text-gray-900">{request.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Amount:</span>
              <span className="text-sm font-semibold text-gray-900">₹ {request.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Month:</span>
              <span className="text-sm text-gray-900">{request.month} {request.year}</span>
            </div>
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Payment proof is unclear, wrong amount, incorrect details..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              disabled={loading}
            />
            <p className="mt-1 text-sm text-gray-500">
              {reason.length}/500 characters
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">
              <strong>Note:</strong> After rejection:
            </p>
            <ul className="mt-2 ml-4 text-sm text-red-800 list-disc space-y-1">
              <li>The member will be notified about the rejection</li>
              <li>They can resubmit the payment proof</li>
              {isResubmission && <li>The resubmission data will be cleared</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span>Reject Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectPaymentModal;
