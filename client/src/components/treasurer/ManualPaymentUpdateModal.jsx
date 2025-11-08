import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { manualPaymentUpdate } from '../../utils/treasurerAPI';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal Container - Themed Panel */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-2xl max-w-md w-full border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
        
        {/* Header - Themed */}
        <div className={`flex justify-between items-center p-6 border-b border-[${BORDER_DIVIDER}]`}>
          <h2 className={`text-xl font-bold text-[${TEXT_PRIMARY}]`}>Confirm Cash Payment</h2>
          <button
            onClick={handleClose}
            className={`text-[${TEXT_SECONDARY}]/70 hover:text-[${TEXT_PRIMARY}] p-2 rounded-full hover:bg-[${BORDER_DIVIDER}]`}
            disabled={updating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Payment Info - Dark background for contrast */}
          <div className={`bg-[${BACKGROUND_PRIMARY}] rounded-lg p-4 space-y-3 border border-[${BORDER_DIVIDER}]`}>
            <div>
              <p className={`text-sm text-[${TEXT_SECONDARY}]/60`}>Member</p>
              <p className={`text-lg font-semibold text-[${TEXT_PRIMARY}]`}>{member.name}</p>
              <p className={`text-sm text-[${TEXT_SECONDARY}]/60`}>{member.usn}</p>
            </div>
            <div>
              <p className={`text-sm text-[${TEXT_SECONDARY}]/60`}>Month</p>
              <p className={`text-lg font-semibold text-[${TEXT_PRIMARY}]`}>{payment.month} {payment.year}</p>
            </div>
            <div>
              <p className={`text-sm text-[${TEXT_SECONDARY}]/60`}>Amount</p>
              {/* Amount Highlighted in Green */}
              <p className="text-2xl font-bold text-green-400">₹{payment.amount}</p>
            </div>
          </div>
          
          {/* Confirmation Message - Themed Alert */}
          <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-300 font-medium">
                **Manual Action Warning:** Are you certain the member has **paid** the amount of **₹{payment.amount}** in cash? This action cannot be easily reversed.
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer - Themed */}
        <div className={`flex justify-end space-x-3 p-6 border-t border-[${BORDER_DIVIDER}] bg-[${BACKGROUND_PRIMARY}]/50 rounded-b-2xl`}>
          {/* Cancel Button - Themed Neutral */}
          <button
            onClick={handleClose}
            className={`px-6 py-2.5 border border-[${BORDER_DIVIDER}] text-[${TEXT_SECONDARY}] rounded-lg hover:bg-[${BORDER_DIVIDER}] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
            disabled={updating}
          >
            Cancel
          </button>
          {/* Confirm Button - Themed Green (Action Color) */}
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-600 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={updating}
          >
            {updating ? (
              <>
                {/* Themed Spinner */}
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualPaymentUpdateModal;