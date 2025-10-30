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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-50">
          <h2 className="text-xl font-bold text-gray-900">Reject Reimbursement</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Request Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Member: <span className="font-semibold text-gray-900">{request.userId.name}</span></p>
            <p className="text-sm text-gray-600 mb-2">Amount: <span className="font-semibold text-gray-900">₹ {request.amount}</span></p>
            <p className="text-sm text-gray-600">Description: <span className="text-gray-900">{request.description}</span></p>
          </div>
          
          {/* Warning */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex">
              <ExclamationIcon className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">This action will:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mark request as rejected</li>
                  <li>Notify member with your reason</li>
                  <li>Member can delete or resubmit</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Rejection Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              className={`w-full px-4 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none`}
              placeholder="Explain why you're rejecting this request (e.g., unclear bill, not club-related, duplicate request, etc.)"
            />
            <div className="flex justify-between items-center mt-1">
              {error ? (
                <p className="text-red-500 text-xs">{error}</p>
              ) : (
                <p className="text-gray-500 text-xs">Min 10 characters</p>
              )}
              <p className="text-gray-500 text-xs">{reason.length}/500</p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            disabled={rejecting}
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={rejecting || !reason.trim()}
          >
            {rejecting ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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