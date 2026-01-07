import { CheckCircle, Clock, XCircle, Download, Calendar, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * PaymentHistoryTable Component
 * Displays payment history in a responsive table format
 * * @param {Array} payments - Array of payment objects
 * @param {Function} onDownload - Callback function to handle payment proof download
 */
const PaymentHistoryTable = ({ payments = [], onDownload }) => {
  
  /**
   * Get status badge with appropriate color and icon
   */
  const getStatusBadge = (status) => {
    // --- AURORA TREASURY COLOR MAPPING ---
    const statusConfig = {
      Paid: {
        // Olive Accent for Success
        bgColor: 'bg-[#A6C36F]/20', 
        textColor: 'text-[#A6C36F]',
        icon: <CheckCircle className="w-4 h-4" />,
        label: 'Paid',
      },
      Pending: {
        // Muted Olive/Secondary Text for Pending
        bgColor: 'bg-yellow-500/20', 
        textColor: 'text-yellow-500',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending',
      },
      Failed: {
        // Dark Panel/Secondary Text for Failed (keeping tone dark/muted)
        bgColor: 'bg-red-500/20', 
        textColor: 'text-red-500',
        icon: <XCircle className="w-4 h-4" />,
        label: 'Failed',
      },
    };

    const config = statusConfig[status] || statusConfig.Pending;

    return (
      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bgColor} ${config.textColor} border border-current/20`}>
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
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] p-8 border border-[#A6C36F]/20">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center mx-auto border border-[#A6C36F]/20">
            <Calendar className="w-8 h-8 text-[#A6C36F]" />
          </div>
          <h3 className="text-lg font-semibold text-[#F5F3E7]">No Payment Records</h3>
          <p className="text-sm text-[#E8E3C5]/60">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] overflow-hidden border border-[#A6C36F]/20">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-[#A6C36F]/20 bg-black/40">
        <h3 className="text-lg font-bold text-[#F5F3E7]">Payment History</h3>
        <p className="text-sm text-[#E8E3C5]/60">Track your monthly group fund payments</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-black/60 border-b border-[#A6C36F]/20">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5]/60 uppercase tracking-wider">
                Month
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5]/60 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5]/60 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5]/60 uppercase tracking-wider">
                Deadline
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5]/60 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A6C36F]/10">
            {payments.map((payment) => (
              <tr
                key={payment._id}
                className={`hover:bg-[#A6C36F]/5 transition-colors ${
                  isOverdue(payment.deadline, payment.status) ? 'bg-red-500/5' : ''
                }`}
              >
                {/* Month */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-[#A6C36F]" />
                    <span className="text-sm font-medium text-[#F5F3E7]">
                      {payment.month}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    <DollarSign className="w-4 h-4 text-[#A6C36F]" />
                    <span className="text-sm font-semibold text-[#F5F3E7]">
                      ₹ {payment.amount}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(payment.status)}
                  {isOverdue(payment.deadline, payment.status) && (
                    <span className="ml-2 text-xs text-red-500 font-medium">
                      (Overdue)
                    </span>
                  )}
                </td>

                {/* Deadline */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`text-sm ${
                    isOverdue(payment.deadline, payment.status)
                      ? 'text-red-500 font-semibold'
                      : 'text-[#E8E3C5]/80'
                  }`}>
                    {formatDate(payment.deadline)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.status === 'Paid' && payment.paymentProof ? (
                    <button
                      onClick={() => handleDownload(payment._id, payment.month)}
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-black bg-[#A6C36F] hover:bg-[#8FAE5D] rounded-lg transition-colors shadow-[0_0_10px_rgba(166,195,111,0.2)]"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : payment.status === 'Pending' && payment.paymentProof ? (
                    <span className="text-xs text-[#E8E3C5]/60 italic">
                      Under Review
                    </span>
                  ) : (
                    <span className="text-xs text-[#E8E3C5]/30">
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
      <div className="md:hidden divide-y divide-[#A6C36F]/10">
        {payments.map((payment) => (
          <div
            key={payment._id}
            className={`p-4 space-y-3 ${
              isOverdue(payment.deadline, payment.status) ? 'bg-red-500/5' : ''
            }`}
          >
            {/* Month and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#A6C36F]" />
                <span className="text-sm font-semibold text-[#F5F3E7]">
                  {payment.month}
                </span>
              </div>
              {getStatusBadge(payment.status)}
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#E8E3C5]/60">Amount</span>
              <span className="text-sm font-bold text-[#F5F3E7]">₹ {payment.amount}</span>
            </div>

            {/* Deadline */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#E8E3C5]/60">Deadline</span>
              <span className={`text-sm ${
                isOverdue(payment.deadline, payment.status)
                  ? 'text-red-500 font-semibold'
                  : 'text-[#F5F3E7]'
              }`}>
                {formatDate(payment.deadline)}
              </span>
            </div>

            {/* Actions */}
            {payment.status === 'Paid' && payment.paymentProof && (
              <button
                onClick={() => handleDownload(payment._id, payment.month)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-black bg-[#A6C36F] hover:bg-[#8FAE5D] rounded-lg transition-colors shadow-[0_0_10px_rgba(166,195,111,0.2)]"
              >
                <Download className="w-4 h-4" />
                <span>Download Payment Proof</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-black/40 border-t border-[#A6C36F]/20">
        <p className="text-xs text-[#E8E3C5]/60 text-center">
          Total Records: <span className="font-semibold text-[#A6C36F]">{payments.length}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;