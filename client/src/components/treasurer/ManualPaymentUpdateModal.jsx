import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { manualPaymentUpdate } from '../../utils/treasurerAPI';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

/**
 * Manual Payment Update Modal
 * Simplified confirmation dialog to mark payments as paid for cash/offline payments
 */
const ManualPaymentUpdateModal = ({ isOpen, onClose, payment, member, onSuccess }) => {
  const [updating, setUpdating] = useState(false);
  
  if (!isOpen || !payment || !member) return null;
  
  const handleConfirm = async () => {
    setUpdating(true);
    
    try {
      // Update existing payment - payment must have _id
      if (!payment._id) {
        throw new Error('Payment ID is required. Cannot update payment without existing record.');
      }
      
      const result = await manualPaymentUpdate(payment._id, {
        paymentMethod: 'Cash',
        note: 'Manually marked as paid by treasurer'
      });
      
      toast.success('Payment marked as paid successfully!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Manual update error:', error);
      const errorMessage = error.message || 'Failed to update payment status';
      toast.error(errorMessage);
    } finally {
      setUpdating(false);
    }
  };
  
  const handleClose = () => {
    if (!updating) {
      onClose();
    }
  };
  
  return (
    // Backdrop - Darkened
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container - Themed Panel */}
      <div className="bg-[#1F221C] rounded-2xl max-w-md w-full border border-[#3A3E36] shadow-[0_0_25px_rgba(166,195,111,0.08)]">
        
        {/* Header - Themed */}
        <div className="flex justify-between items-center p-6 border-b border-[#3A3E36]">
          <h2 className="text-xl font-bold text-[#F5F3E7]">Confirm Cash Payment</h2>
          <button
            onClick={handleClose}
            className="text-[#E8E3C5]/70 hover:text-[#F5F3E7] p-2 rounded-full hover:bg-[#3A3E36] transition-colors"
            disabled={updating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Payment Info - Dark background for contrast */}
          <div className="bg-[#0B0B09] rounded-lg p-4 space-y-3 border border-[#3A3E36]">
            <div>
              <p className="text-sm text-[#E8E3C5]/60">Member</p>
              <p className="text-lg font-semibold text-[#F5F3E7]">{member.name}</p>
              <p className="text-sm text-[#E8E3C5]/60">{member.usn}</p>
            </div>
            <div>
              <p className="text-sm text-[#E8E3C5]/60">Month</p>
              <p className="text-lg font-semibold text-[#F5F3E7]">{payment.month} {payment.year}</p>
            </div>
            <div>
              <p className="text-sm text-[#E8E3C5]/60">Amount</p>
              {/* Amount Highlighted in Green */}
              <p className="text-2xl font-bold text-[#A6C36F]">₹{payment.amount}</p>
            </div>
          </div>
          
          {/* Confirmation Message - Themed Alert */}
          <div className="bg-[#A6C36F]/10 border border-[#A6C36F]/30 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-[#A6C36F] mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#E8E3C5] font-medium">
                <strong className="text-[#A6C36F]">Manual Action Warning:</strong> Are you certain the member has <strong className="text-[#F5F3E7]">paid</strong> the amount of <strong className="text-[#F5F3E7]">₹{payment.amount}</strong> in cash? This action cannot be easily reversed.
              </p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex space-x-3 pt-2">
            <button
              onClick={handleClose}
              disabled={updating}
              className="flex-1 px-4 py-3 border border-[#3A3E36] text-[#E8E3C5] rounded-xl hover:bg-[#3A3E36] hover:text-[#F5F3E7] transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={updating}
              className="flex-1 px-4 py-3 bg-[#A6C36F] text-[#0B0B09] rounded-xl hover:bg-[#8FAE5D] transition-colors font-bold shadow-lg hover:shadow-[0_0_15px_rgba(166,195,111,0.4)] flex items-center justify-center"
            >
              {updating ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0B0B09]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Payment
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentUpdateModal;