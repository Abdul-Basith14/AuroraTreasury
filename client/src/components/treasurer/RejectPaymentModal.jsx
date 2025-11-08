import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { rejectPayment, rejectResubmission } from '../../utils/treasurerAPI';
import { XCircle, X } from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
// ------------------------------------------------

/**
 * Reject Payment Modal - Modal for rejecting payment with reason
 */
const RejectReimbursementModal = ({ request, isResubmission, onClose, onSuccess }) => {
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
        // Clear reason on success
        setReason(''); 
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
    // Backdrop - Darkened
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      {/* Modal Content - Themed Panel */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[${BORDER_DIVIDER}]`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[${BORDER_DIVIDER}]/50 pb-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-500" /> {/* Keep red for rejection */}
            <h3 className={`text-xl font-bold text-[${TEXT_PRIMARY}]`}>
              Reject Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`text-[${TEXT_SECONDARY}]/70 hover:text-[${TEXT_PRIMARY}] transition p-1 rounded-full hover:bg-[${BORDER_DIVIDER}]`}
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <p className={`text-[${TEXT_SECONDARY}]/90`}>
            Please provide a **detailed and constructive** reason for rejecting this reimbursement request.
          </p>
          
          {/* Request Details Panel - Darker background */}
          <div className={`bg-[${BORDER_DIVIDER}]/50 rounded-lg p-4 space-y-2 text-[${TEXT_SECONDARY}]`}>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[${TEXT_SECONDARY}]/80">Member:</span>
              <span className="text-sm text-[${TEXT_PRIMARY}]">{request.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[${TEXT_SECONDARY}]/80">Amount:</span>
              <span className="text-sm font-semibold text-red-400">₹ {request.amount}</span> {/* Highlight amount in context */}
            </div>
            {/* Note: request.month and request.year are often missing in real data unless explicitly added, keeping for reference */}
            {/* <div className="flex justify-between">
              <span className="text-sm font-medium text-[${TEXT_SECONDARY}]/80">Month:</span>
              <span className="text-sm text-[${TEXT_PRIMARY}]">{request.month} {request.year}</span>
            </div> */}
          </div>

          {/* Reason Input */}
          <div>
            <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value).slice(0, 500)} // Added character limit slice
              placeholder="e.g., Payment proof is unclear, wrong amount, incorrect details..."
              rows={4}
              // Themed Input
              className={`w-full px-4 py-3 border border-[${BORDER_DIVIDER}] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500/50 resize-none bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}] placeholder-[${TEXT_SECONDARY}]/40`}
              disabled={loading}
              maxLength={500}
            />
            <p className={`mt-1 text-sm text-[${TEXT_SECONDARY}]/60`}>
              {reason.length}/500 characters
            </p>
          </div>

          {/* Warning Note - Themed Red Panel */}
          <div className="bg-red-900/30 border border-red-600/50 rounded-lg p-4">
            <p className="text-sm text-red-400">
              <strong>Note:</strong> After rejection:
            </p>
            <ul className="mt-2 ml-4 text-sm text-red-300 list-disc space-y-1">
              <li>The member will be notified about the rejection</li>
              <li>They can resubmit the request/proof</li>
              {isResubmission && <li>The resubmission data will be cleared</li>}
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-[${BORDER_DIVIDER}]/50">
          {/* Cancel Button - Themed Secondary Action */}
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-6 py-2.5 border border-[${BORDER_DIVIDER}]/70 text-[${TEXT_SECONDARY}] rounded-xl hover:bg-[${BORDER_DIVIDER}] transition font-medium disabled:opacity-50`}
          >
            Cancel
          </button>
          {/* Reject Button - Themed Primary Action (Red) */}
          <button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            className="px-6 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center space-x-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Rejecting...</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                <span>Reject Request</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReimbursementModal;