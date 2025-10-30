import { CheckCircle, Clock, XCircle, Download, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PaymentHistoryTable Component
 * Displays payment history in a responsive table format
 * 
 * @param {Array} payments - Array of payment objects
 * @param {Function} onDownload - Callback function to handle payment proof download
 */
const PaymentHistoryTable = ({ payments = [], onDownload }) => {
  
  /**
   * Get status badge with appropriate color and icon
   */
  const getStatusBadge = (status) => {
    const statusConfig = {
      Paid: {
        bgColor: 'bg-green-100',
        textColor: 'text-green-700',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Paid',
      },
      Pending: {
        bgColor: 'bg-yellow-100',
        textColor: 'text-yellow-700',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending',
      },
      Failed: {
        bgColor: 'bg-red-100',
        textColor: 'text-red-700',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed',
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {config.icon}
        <span>{config.label}</span>
      </span>
    );
  };

  /**
   * Format date to readable string
   */
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Handle download button click
   */
  const handleDownload = async (paymentId, month) => {
    try {
      await onDownload(paymentId);
      toast.success(`Opening payment proof for ${month}`);
    } catch (error) {
      toast.error('Failed to download payment proof');
    }
  };

  /**
   * Check if payment is overdue
   */
  const isOverdue = (deadline, status) => {
    return status === 'Pending' && new Date(deadline) < new Date();
  };

  // Show empty state if no payments
  if (!payments || payments.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">No Payment Records</h3>
          <p className="text-sm text-gray-500">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
        <p className="text-sm text-gray-600">Track your monthly group fund payments</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr
                key={payment._id}
                className={`hover:bg-gray-50 transition-colors ${
                  isOverdue(payment.deadline, payment.status) ? 'bg-red-50/50' : ''
                }`}
              >
                {/* Month */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">
                      {payment.month}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-900">
                      ₹ {payment.amount}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                  {isOverdue(payment.deadline, payment.status) && (
                    <span className="ml-2 text-xs text-red-600 font-medium">
                      (Overdue)
                    </span>
                  )}
                </td>

                {/* Deadline */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${
                    isOverdue(payment.deadline, payment.status)
                      ? 'text-red-600 font-semibold'
                      : 'text-gray-600'
                  }`}>
                    {formatDate(payment.deadline)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.status === 'Paid' && payment.paymentProof ? (
                    <button
                      onClick={() => handleDownload(payment._id, payment.month)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : payment.status === 'Pending' && payment.paymentProof ? (
                    <span className="text-xs text-gray-500 italic">
                      Under Review
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">
                      -
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-gray-200">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className={`p-4 space-y-3 ${
              isOverdue(payment.deadline, payment.status) ? 'bg-red-50/50' : ''
            }`}
          >
            {/* Month and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-semibold text-gray-900">
                  {payment.month}
                </span>
              </div>
              {getStatusBadge(payment.status)}
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Amount</span>
              <span className="text-sm font-bold text-gray-900">₹ {payment.amount}</span>
            </div>

            {/* Deadline */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">Deadline</span>
              <span className={`text-sm ${
                isOverdue(payment.deadline, payment.status)
                  ? 'text-red-600 font-semibold'
                  : 'text-gray-900'
              }`}>
                {formatDate(payment.deadline)}
              </span>
            </div>

            {/* Actions */}
            {payment.status === 'Paid' && payment.paymentProof && (
              <button
                onClick={() => handleDownload(payment._id, payment.month)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Payment Proof</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-xs text-gray-600 text-center">
          Total Records: <span className="font-semibold">{payments.length}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;
