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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Modal Content - Themed Panel */}
      <div className="bg-[#1F221C] rounded-xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#3A3E36]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 border-b border-[#3A3E36] pb-4">
          <div className="flex items-center space-x-3">
            <XCircle className="w-8 h-8 text-red-500" /> {/* Keep red for rejection */}
            <h3 className="text-xl font-bold text-[#F5F3E7]">
              Reject Request
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#E8E3C5]/70 hover:text-[#F5F3E7] transition p-1 rounded-full hover:bg-[#3A3E36]"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          <p className="text-[#E8E3C5]/90">
            Please provide a <strong className="text-[#F5F3E7]">detailed and constructive</strong> reason for rejecting this payment request.
          </p>
          
          {/* Request Details Panel - Darker background */}
          <div className="bg-[#0B0B09] rounded-lg p-4 space-y-2 border border-[#3A3E36]">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]/80">Member:</span>
              <span className="text-sm text-[#F5F3E7]">{request.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]/80">Amount:</span>
              <span className="text-sm font-semibold text-red-400">₹ {request.amount}</span> {/* Highlight amount in context */}
            </div>
            {/* Note: request.month and request.year are often missing in real data unless explicitly added, keeping for reference */}
            {/* <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]/80">Month:</span>
              <span className="text-sm text-[#F5F3E7]">{request.month} {request.year}</span>
            </div> */}
          </div>

          {/* Reason Input */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#0B0B09] border border-[#3A3E36] rounded-xl p-3 text-[#F5F3E7] placeholder-[#E8E3C5]/30 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all resize-none h-32"
              placeholder="e.g., Incorrect amount, blurry screenshot, wrong month..."
              disabled={loading}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-[#3A3E36] text-[#E8E3C5] rounded-xl hover:bg-[#3A3E36] hover:text-[#F5F3E7] transition-colors font-medium"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            disabled={loading || !reason.trim()}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold shadow-lg hover:shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Rejecting...
              </span>
            ) : (
              'Reject Payment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectPaymentModal;