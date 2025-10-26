import { useState, useEffect } from 'react';
import { X, Clock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PaymentHistoryModal Component
 * Displays complete status history timeline for a payment
 * 
 * @param {boolean} isOpen - Whether modal is visible
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
      case 'Paid':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'Failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {payment.month} - ₹{payment.amount}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">Current Status:</p>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(
                currentStatus
              )}`}
            >
              {currentStatus}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Timeline
            </h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No history available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                  >
                    {/* Status Badge */}
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
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Clock className="w-4 h-4 mr-1" />
                      <span>
                        {new Date(entry.changedDate).toLocaleString('en-IN', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    </div>

                    {/* Changed By */}
                    {entry.changedBy && (
                      <div className="flex items-center text-sm text-gray-700 mb-2">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium">{entry.changedBy.name}</span>
                        {entry.changedBy.role && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {entry.changedBy.role}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    {entry.reason && (
                      <div className="text-sm text-gray-600 mt-2 italic">
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
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
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
