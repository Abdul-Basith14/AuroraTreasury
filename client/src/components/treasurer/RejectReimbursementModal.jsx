import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { rejectReimbursement } from '../../utils/treasurerAPI';
import { X as XIcon, XCircle as XCircleIcon, AlertTriangle as ExclamationIcon } from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
// ------------------------------------------------

const RejectReimbursementModal = ({ isOpen, onClose, request, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen || !request) return null;
  
  const handleReject = async () => {
    if (!reason.trim() || reason.trim().length < 10) {
      setError('Rejection reason must be at least 10 characters');
      return;
    }
    
    setRejecting(true);
    setError('');
    
    try {
      await rejectReimbursement(request._id, { reason: reason.trim() });
      
      onSuccess();
      handleClose();
      toast.success('Reimbursement request rejected successfully.');
    } catch (error) {
      console.error('Reject reimbursement error:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    } finally {
      setRejecting(false);
    }
  };
  
  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };
  
  return (
    // Backdrop - Darkened
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal Content - Themed Panel */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl max-w-md w-full border border-[${BORDER_DIVIDER}] shadow-2xl`}>
        
        {/* Header - Red highlight for rejection context */}
        <div className={`flex justify-between items-center p-6 border-b border-[${BORDER_DIVIDER}] bg-red-900/20 rounded-t-xl`}>
          <div className="flex items-center space-x-2">
            <XCircleIcon className="w-6 h-6 text-red-500" />
            <h2 className={`text-xl font-bold text-[${TEXT_PRIMARY}]`}>Reject Reimbursement</h2>
          </div>
          <button
            onClick={handleClose}
            className={`text-[${TEXT_SECONDARY}]/70 hover:text-[${TEXT_PRIMARY}] p-1 rounded-full hover:bg-[${BORDER_DIVIDER}] transition`}
            disabled={rejecting}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Request Info Panel - Darker background */}
          <div className={`bg-[${BORDER_DIVIDER}]/50 rounded-lg p-4 space-y-2 text-[${TEXT_SECONDARY}]`}>
            <p className="text-sm text-[${TEXT_SECONDARY}]/70">Member: <span className={`font-semibold text-[${TEXT_PRIMARY}]`}>{request.userId.name}</span></p>
            <p className="text-sm text-[${TEXT_SECONDARY}]/70">Amount: <span className={`font-semibold text-red-400`}>₹ {request.amount}</span></p>
            <p className="text-sm text-[${TEXT_SECONDARY}]/70">Description: <span className={`text-[${TEXT_PRIMARY}]`}>{request.description}</span></p>
          </div>
          
          {/* Warning Panel - Red Themed */}
          <div className="bg-red-900/30 border-l-4 border-red-500 p-4 rounded">
            <div className="flex">
              <ExclamationIcon className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-300">
                <p className="font-medium mb-1">Warning: This action will permanently:</p>
                <ul className="list-disc list-inside space-y-1 ml-1">
                  <li>Mark the request as **Rejected**</li>
                  <li>Notify the member with your provided reason</li>
                  <li>Allow the member to resubmit a new request</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Rejection Reason Input */}
          <div>
            <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>
              Reason for Rejection <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows="4"
              maxLength="500"
              // Themed Input
              className={`w-full px-4 py-3 border ${error ? 'border-red-500' : `border-[${BORDER_DIVIDER}]/70`} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500/50 resize-none bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}] placeholder-[${TEXT_SECONDARY}]/40`}
              placeholder="Explain why you're rejecting this request (e.g., unclear bill, not club-related, duplicate request, etc.)"
            />
            <div className="flex justify-between items-center mt-1">
              {error ? (
                <p className="text-red-500 text-xs font-medium">{error}</p>
              ) : (
                <p className={`text-[${TEXT_SECONDARY}]/60 text-xs`}>Min 10 characters required for clear communication</p>
              )}
              <p className={`text-[${TEXT_SECONDARY}]/60 text-xs`}>{reason.length}/500</p>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className={`flex justify-end space-x-3 p-6 border-t border-[${BORDER_DIVIDER}] bg-[${BACKGROUND_PRIMARY}] rounded-b-xl`}>
          {/* Cancel Button - Themed Secondary Action */}
          <button
            onClick={handleClose}
            className={`px-6 py-2 border border-[${BORDER_DIVIDER}]/70 text-[${TEXT_SECONDARY}] rounded-xl hover:bg-[${BORDER_DIVIDER}] transition font-medium`}
            disabled={rejecting}
          >
            Cancel
          </button>
          {/* Reject Button - Themed Primary Action (Red) */}
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={rejecting || !reason.trim() || reason.trim().length < 10}
          >
            {rejecting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Rejecting...
              </>
            ) : (
              <>
                <XCircleIcon className="w-5 h-5 mr-2" />
                Reject Request
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReimbursementModal;