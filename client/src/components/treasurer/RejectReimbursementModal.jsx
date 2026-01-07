import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { rejectReimbursement } from '../../utils/treasurerAPI';
import { X as XIcon, XCircle as XCircleIcon, AlertTriangle as ExclamationIcon } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0B09] rounded-2xl max-w-md w-full border border-[#A6C36F]/20 shadow-[0_0_50px_rgba(166,195,111,0.1)]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#A6C36F]/20 bg-red-500/5 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <XCircleIcon className="w-6 h-6 text-red-500" />
            </div>
            <h2 className="text-xl font-bold text-[#F5F3E7]">Reject Request</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#E8E3C5]/50 hover:text-[#F5F3E7] p-2 rounded-full hover:bg-[#A6C36F]/10 transition"
            disabled={rejecting}
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Request Info Panel */}
          <div className="bg-[#A6C36F]/5 rounded-xl p-4 space-y-3 border border-[#A6C36F]/10">
            <div className="flex justify-between items-center border-b border-[#A6C36F]/10 pb-2">
              <span className="text-xs text-[#E8E3C5]/60 uppercase tracking-wider">Member</span>
              <span className="font-bold text-[#F5F3E7]">{request.userId.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-[#A6C36F]/10 pb-2">
              <span className="text-xs text-[#E8E3C5]/60 uppercase tracking-wider">Amount</span>
              <span className="font-bold text-red-400">₹ {request.amount}</span>
            </div>
            <div>
              <span className="text-xs text-[#E8E3C5]/60 uppercase tracking-wider block mb-1">Description</span>
              <span className="text-sm text-[#F5F3E7]">{request.description}</span>
            </div>
          </div>
          
          {/* Warning Panel */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start">
            <ExclamationIcon className="w-5 h-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-200/90">
              <p className="font-semibold mb-1 text-red-200">This action will:</p>
              <ul className="list-disc list-inside space-y-1 ml-1 opacity-80">
                <li>Mark the request as Rejected</li>
                <li>Notify the member with your reason</li>
                <li>Allow the member to resubmit</li>
              </ul>
            </div>
          </div>
          
          {/* Rejection Reason Input */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Reason for Rejection <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              rows="4"
              maxLength="500"
              className={`w-full px-4 py-3 bg-black/40 border ${error ? 'border-red-500/50 focus:ring-red-500/50' : 'border-[#A6C36F]/20 focus:ring-[#A6C36F]/50'} rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/30 focus:ring-2 focus:border-transparent outline-none transition resize-none`}
              placeholder="Explain why you're rejecting this request (e.g., unclear bill, not club-related, duplicate request, etc.)"
            />
            <div className="flex justify-between items-center mt-2">
              {error ? (
                <p className="text-red-400 text-xs font-medium flex items-center">
                  <ExclamationIcon className="w-3 h-3 mr-1" /> {error}
                </p>
              ) : (
                <p className="text-[#E8E3C5]/40 text-xs">Min 10 characters required</p>
              )}
              <p className="text-[#E8E3C5]/40 text-xs">{reason.length}/500</p>
            </div>
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="flex gap-4 p-6 border-t border-[#A6C36F]/20 bg-black/20 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-xl font-semibold text-[#E8E3C5] bg-black/40 border border-[#A6C36F]/20 hover:bg-[#A6C36F]/10 transition"
            disabled={rejecting}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="flex-1 px-4 py-3 rounded-xl font-bold text-[#F5F3E7] bg-red-500/80 hover:bg-red-600 transition shadow-[0_0_20px_rgba(239,68,68,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={rejecting || !reason.trim() || reason.trim().length < 10}
          >
            {rejecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                Rejecting...
              </>
            ) : (
              <>
                <XCircleIcon className="w-5 h-5 mr-2" />
                Confirm Reject
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectReimbursementModal;