import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { verifyPayment, verifyResubmission } from '../../utils/treasurerAPI';
import { CheckCircle, X } from 'lucide-react';

/**
 * Verify Payment Modal - Confirmation modal for payment verification
 */
const VerifyPaymentModal = ({ request, isResubmission, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Handle verification
  const handleVerify = async () => {
    try {
      setLoading(true);
      
      const verifyFunction = isResubmission ? verifyResubmission : verifyPayment;
      const data = await verifyFunction(request._id);
      
      if (data.success) {
        toast.success(data.message || 'Payment verified successfully!');
        
        // Emit event for member list refresh
        window.dispatchEvent(new CustomEvent('paymentVerified', { 
          detail: { 
            memberId: request.userId._id,
            paymentId: request._id 
          } 
        }));
        
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || 'Failed to verify payment');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
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
            <CheckCircle className="w-8 h-8 text-green-600" />
            <h3 className="text-xl font-bold text-gray-900">
              Verify Payment
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
            Are you sure you want to verify and approve this payment?
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Member:</span>
              <span className="text-sm text-gray-900">{request.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Amount:</span>
              <span className="text-sm font-semibold text-green-600">₹{request.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Month:</span>
              <span className="text-sm text-gray-900">{request.month} {request.year}</span>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Note:</strong> This action will:
            </p>
            <ul className="mt-2 ml-4 text-sm text-green-800 list-disc space-y-1">
              <li>Mark the payment as verified and paid</li>
              <li>Update the member's total paid amount</li>
              <li>Remove from pending requests</li>
              {isResubmission && <li>Clear the resubmission data</li>}
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
            onClick={handleVerify}
            disabled={loading}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 font-medium disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Verify Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPaymentModal;
