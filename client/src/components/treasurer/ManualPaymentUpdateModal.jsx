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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Confirm Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
            disabled={updating}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Payment Info */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-600">Member</p>
              <p className="text-lg font-semibold text-gray-900">{member.name}</p>
              <p className="text-sm text-gray-600">{member.usn}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Month</p>
              <p className="text-lg font-semibold text-gray-900">{payment.month} {payment.year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="text-2xl font-bold text-green-600">₹{payment.amount}</p>
            </div>
          </div>
          
          {/* Confirmation Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800 font-medium">
                Are you sure the member has paid the amount of ₹{payment.amount}?
              </p>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={updating}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={updating}
          >
            {updating ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
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
