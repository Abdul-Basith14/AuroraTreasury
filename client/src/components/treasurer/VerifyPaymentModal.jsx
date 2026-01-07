import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { verifyPayment, verifyResubmission } from '../../utils/treasurerAPI';
import { CheckCircle, X } from 'lucide-react';

/**
 * Verify Payment Modal - Confirmation modal for payment verification
 */
const VerifyPaymentModal = ({ request, isResubmission, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  // Custom Button classes from the theme
  const accentButtonClasses = "bg-[#A6C36F] text-[#0B0B09] hover:bg-[#8FAE5D] transition-all duration-300 rounded-2xl px-6 py-2.5 font-semibold disabled:opacity-50";
  const defaultButtonClasses = "bg-[#3A3E36]/40 text-[#F5F3E7] hover:bg-[#3A3E36] transition-all duration-300 rounded-2xl px-6 py-2.5 font-semibold disabled:opacity-50";


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
    // Modal Backdrop - Darker background
    <div className="fixed inset-0 bg-[#0B0B09] bg-opacity-70 z-50 flex items-center justify-center p-4">
      {/* Modal Content - Card Container Style */}
      <div className="bg-[#1F221C] rounded-2xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] ring-1 ring-[#3A3E36]/40">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            {/* Accent Olive Icon Tone */}
            <CheckCircle className="w-8 h-8 text-[#A6C36F]" />
            <h3 className="text-xl font-bold text-[#F5F3E7]">
              Verify Payment
            </h3>
          </div>
          <button
            onClick={onClose}
            // Muted Text/Border Color for Close button
            className="text-[#E8E3C5]/50 hover:text-[#E8E3C5] transition"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-6 space-y-4">
          {/* Primary Text */}
          <p className="text-[#F5F3E7]">
            Are you sure you want to verify and approve this payment?
          </p>
          
          {/* Summary Card (Subtle Panel) */}
          <div className="bg-[#0B0B09] rounded-lg p-4 space-y-2 border border-[#3A3E36]">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]">Member:</span>
              <span className="text-sm text-[#F5F3E7]">{request.userId?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]">Amount:</span>
              {/* Accent Olive for Amount */}
              <span className="text-sm font-semibold text-[#A6C36F]">₹ {request.amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-[#E8E3C5]">Month:</span>
              <span className="text-sm text-[#F5F3E7]">{request.month} {request.year}</span>
            </div>
          </div>

          {/* Note/Warning Alert (Themed to Olive/Accent) */}
          <div className="bg-[#A6C36F]/10 border border-[#A6C36F]/50 rounded-lg p-4">
            <p className="text-sm text-[#A6C36F]">
              <strong className="text-[#A6C36F]">Note:</strong> This action will:
            </p>
            <ul className="mt-2 ml-4 text-sm text-[#A6C36F] list-disc space-y-1">
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
            className={`
              ${defaultButtonClasses}
              border-none
            `}
          >
            Cancel
          </button>
          <button
            onClick={handleVerify}
            disabled={loading}
            className={`${accentButtonClasses} flex items-center space-x-2`}
          >
            {loading ? (
              <>
                {/* Loader in Accent Olive */}
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0B0B09]"></div>
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