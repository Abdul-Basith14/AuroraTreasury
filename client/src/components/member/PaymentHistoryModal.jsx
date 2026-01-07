import { useState, useEffect } from 'react';
import { X, Clock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PaymentHistoryModal Component
 * Displays complete status history timeline for a payment
 * * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Handler to close modal
 * @param {Object} payment - Payment record to show history for
 */
const PaymentHistoryModal = ({ isOpen, onClose, payment }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    if (isOpen && payment) {
      fetchPaymentHistory();
    }
  }, [isOpen, payment]);

  /**
   * Fetch payment history from API
   */
  const fetchPaymentHistory = async () => {
    setLoading(true);
    try {
      const response = await groupFundAPI.getPaymentHistory(payment._id);
      
      if (response.success) {
        setHistory(response.history || []);
        setCurrentStatus(response.currentStatus);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
      toast.error('Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get status badge color
   */
  const getStatusColor = (status) => {
    switch (status) {
      // Paid: Green -> Accent Olive
      case 'Paid':
        return 'bg-[#A6C36F]/20 text-[#A6C36F] border-[#A6C36F]/40';
      // Pending: Yellow -> Text Secondary/Muted Olive
      case 'Pending':
        return 'bg-[#3A3E36]/40 text-[#E8E3C5] border-[#3A3E36]';
      // Failed: Red -> Text Secondary/Muted Olive (Can use a subtle red if needed, but sticking to the palette)
      case 'Failed':
        return 'bg-[#1F221C] text-[#E8E3C5]/70 border-[#3A3E36]';
      // Default: Gray -> Muted Olive
      default:
        return 'bg-[#3A3E36]/40 text-[#E8E3C5]/80 border-[#3A3E36]';
    }
  };

  if (!isOpen || !payment) return null;

  return (
    // Backdrop: Deep black base with opacity
    <div className="fixed inset-0 bg-[#0B0B09] bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal Card: (a) Card Container */}
      <div 
        className="bg-[#1F221C] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto 
          shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#3A3E36]/40 text-[#F5F3E7]"
      >
        {/* Header */}
        {/* border-gray-200 -> border-[#3A3E36], bg-white -> bg-[#1F221C] (Sticky Header) */}
        <div className="flex justify-between items-center p-6 border-b border-[#3A3E36] sticky top-0 bg-[#1F221C] z-10">
          <div>
            {/* text-gray-900 -> text-primary */}
            <h2 className="text-2xl font-bold text-[#F5F3E7]">Payment History</h2>
            {/* text-gray-600 -> text-secondary */}
            <p className="text-sm text-[#E8E3C5] mt-1">
              {payment.month} - ₹ {payment.amount}
            </p>
          </div>
          <button
            onClick={onClose}
            // text-gray-500/hover:text-gray-700/hover:bg-gray-100 -> text-[#E8E3C5]/hover:text-[#A6C36F]/hover:bg-[#3A3E36]/40
            className="text-[#E8E3C5] hover:text-[#A6C36F] p-2 rounded-full hover:bg-[#3A3E36]/40 transition"
          >
            {/* Icon color inherits from button text */}
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6">
            {/* text-gray-600 -> text-secondary */}
            <p className="text-sm text-[#E8E3C5] mb-2">Current Status:</p>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                currentStatus
              )}`}
            >
              {currentStatus}
            </span>
          </div>

          {/* Timeline Section */}
          <div className="border-t border-[#3A3E36] pt-6">
            {/* text-gray-900 -> text-primary */}
            <h3 className="text-lg font-semibold text-[#F5F3E7] mb-4">
              Status Timeline
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                {/* Loader: border-blue-200/border-t-blue-600 -> border-Accent-Olive/border-t-Accent-Olive */}
                <div className="w-8 h-8 border-4 border-[#A6C36F]/20 border-t-[#A6C36F] rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-[#E8E3C5]/70">
                {/* text-gray-500/text-gray-400 -> text-secondary/accent */}
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-[#A6C36F]" />
                <p>No history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    // Timeline Item: bg-gray-50/border-gray-200 -> bg-[#1F221C]/80/border-[#3A3E36]
                    className="bg-[#1F221C]/80 rounded-lg p-4 border border-[#3A3E36]"
                  >
                    {/* Status Badge - uses getStatusColor() dynamically */}
                    <div className="flex items-start mb-2">
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          entry.status
                        )}`}
                      >
                        {entry.status}
                      </div>
                    </div>

                    {/* Date */}
                    {/* text-gray-600 -> text-secondary, Icon color inherits */}
                    <div className="flex items-center text-sm text-[#E8E3C5]/80 mb-2">
                      <Clock className="w-4 h-4 mr-1 text-[#A6C36F]" />
                      <span>
                        {new Date(entry.changedDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {/* Changed By */}
                    {entry.changedBy && (
                      // text-gray-700 -> text-primary, Icon color inherits
                      <div className="flex items-center text-sm text-[#F5F3E7] mb-2">
                        <User className="w-4 h-4 mr-1 text-[#A6C36F]" />
                        <span className="font-medium">{entry.changedBy.name}</span>
                        {entry.changedBy.role && (
                          // Role Badge: bg-blue-100/text-blue-700 -> Accent Olive/Text Primary
                          <span className="ml-2 text-xs bg-[#A6C36F]/20 text-[#A6C36F] px-2 py-0.5 rounded">
                            {entry.changedBy.role}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    {entry.reason && (
                      // text-gray-600 -> text-secondary
                      <div className="text-sm text-[#E8E3C5]/80 mt-2 italic">
                        "{entry.reason}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              // Close Button: bg-gray-600/text-white/hover:bg-gray-700 -> (d) Button (Accent Olive) style for primary action
              className="px-6 py-2 bg-[#A6C36F] text-[#0B0B09] rounded-2xl hover:bg-[#8FAE5D] transition font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;