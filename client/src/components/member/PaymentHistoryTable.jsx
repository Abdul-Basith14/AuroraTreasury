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
        bgColor: 'bg-[#3A3E36]/40', 
        textColor: 'text-[#E8E3C5]',
        icon: <Clock className="w-4 h-4" />,
        label: 'Pending',
      },
      Failed: {
        // Dark Panel/Secondary Text for Failed (keeping tone dark/muted)
        bgColor: 'bg-[#1F221C]', 
        textColor: 'text-[#E8E3C5]/70',
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
      // bg-white -> bg-[#1F221C], shadow-lg -> custom glow/shadow
      <div className="bg-[#1F221C] rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] p-8 border border-[#3A3E36]/40">
        <div className="text-center space-y-3">
          {/* bg-gray-100 -> bg-[#3A3E36]/40 */}
          <div className="w-16 h-16 bg-[#3A3E36]/40 rounded-full flex items-center justify-center mx-auto">
            {/* text-gray-400 -> text-accent-olive */}
            <Calendar className="w-8 h-8 text-[#A6C36F]" />
          </div>
          {/* text-gray-900 -> text-primary */}
          <h3 className="text-lg font-semibold text-[#F5F3E7]">No Payment Records</h3>
          {/* text-gray-500 -> text-secondary */}
          <p className="text-sm text-[#E8E3C5]">
            Your payment history will appear here once you start making payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    // bg-white -> bg-[#1F221C], shadow-lg -> custom glow/shadow
    <div className="bg-[#1F221C] rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] overflow-hidden border border-[#3A3E36]/40">
      {/* Table Header */}
      {/* border-gray-200 -> border-[#3A3E36], bg-gradient... -> bg-[#1F221C] (Panel BG) */}
      <div className="px-6 py-4 border-b border-[#3A3E36] bg-[#1F221C]">
        {/* text-gray-900 -> text-primary */}
        <h3 className="text-lg font-bold text-[#F5F3E7]">Payment History</h3>
        {/* text-gray-600 -> text-secondary */}
        <p className="text-sm text-[#E8E3C5]">Track your monthly group fund payments</p>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          {/* bg-gray-50 -> bg-[#0B0B09], border-gray-200 -> border-[#3A3E36] */}
          <thead className="bg-[#0B0B09] border-b border-[#3A3E36]">
            <tr>
              {/* text-gray-700 -> text-secondary */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5] uppercase tracking-wider">
                Month
              </th>
              {/* text-gray-700 -> text-secondary */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5] uppercase tracking-wider">
                Amount
              </th>
              {/* text-gray-700 -> text-secondary */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5] uppercase tracking-wider">
                Status
              </th>
              {/* text-gray-700 -> text-secondary */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5] uppercase tracking-wider">
                Deadline
              </th>
              {/* text-gray-700 -> text-secondary */}
              <th className="px-6 py-3 text-left text-xs font-semibold text-[#E8E3C5] uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          {/* divide-gray-200 -> divide-[#3A3E36] */}
          <tbody className="divide-y divide-[#3A3E36]">
            {payments.map((payment) => (
              <tr
                key={payment._id}
                // hover:bg-gray-50 -> hover:bg-[#1F221C]/80, bg-red-50/50 -> bg-[#1F221C]/80 + Red text for overdue details
                className={`hover:bg-[#1F221C]/80 transition-colors ${
                  isOverdue(payment.deadline, payment.status) ? 'bg-[#1F221C]/80' : ''
                }`}
              >
                {/* Month */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {/* text-gray-400 -> text-accent-olive */}
                    <Calendar className="w-4 h-4 text-[#A6C36F]" />
                    {/* text-gray-900 -> text-primary */}
                    <span className="text-sm font-medium text-[#F5F3E7]">
                      {payment.month}
                    </span>
                  </div>
                </td>

                {/* Amount */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-1">
                    {/* text-gray-400 -> text-accent-olive */}
                    <DollarSign className="w-4 h-4 text-[#A6C36F]" />
                    {/* text-gray-900 -> text-primary */}
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
                    // text-red-600 -> text-red-500, text-gray-600 -> text-secondary
                    isOverdue(payment.deadline, payment.status)
                      ? 'text-red-500 font-semibold'
                      : 'text-[#E8E3C5]'
                  }`}>
                    {formatDate(payment.deadline)}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {payment.status === 'Paid' && payment.paymentProof ? (
                    <button
                      onClick={() => handleDownload(payment._id, payment.month)}
                      // Action Button: text-blue-700/bg-blue-50/hover:bg-blue-100 -> (d) Accent Olive Button style
                      className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium text-[#0B0B09] bg-[#A6C36F] hover:bg-[#8FAE5D] rounded-2xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  ) : payment.status === 'Pending' && payment.paymentProof ? (
                    // text-gray-500 -> text-secondary
                    <span className="text-xs text-[#E8E3C5]/80 italic">
                      Under Review
                    </span>
                  ) : (
                    // text-gray-400 -> text-secondary/50
                    <span className="text-xs text-[#E8E3C5]/50">
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
      {/* divide-gray-200 -> divide-[#3A3E36] */}
      <div className="md:hidden divide-y divide-[#3A3E36]">
        {payments.map((payment) => (
          <div
            key={payment._id}
            // bg-red-50/50 -> darker panel bg
            className={`p-4 space-y-3 ${
              isOverdue(payment.deadline, payment.status) ? 'bg-[#1F221C]/80' : ''
            }`}
          >
            {/* Month and Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {/* text-gray-400 -> text-accent-olive */}
                <Calendar className="w-4 h-4 text-[#A6C36F]" />
                {/* text-gray-900 -> text-primary */}
                <span className="text-sm font-semibold text-[#F5F3E7]">
                  {payment.month}
                </span>
              </div>
              {getStatusBadge(payment.status)}
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between">
              {/* text-gray-600 -> text-secondary */}
              <span className="text-xs text-[#E8E3C5]">Amount</span>
              {/* text-gray-900 -> text-primary */}
              <span className="text-sm font-bold text-[#F5F3E7]">₹ {payment.amount}</span>
            </div>

            {/* Deadline */}
            <div className="flex items-center justify-between">
              {/* text-gray-600 -> text-secondary */}
              <span className="text-xs text-[#E8E3C5]">Deadline</span>
              <span className={`text-sm ${
                // text-red-600 -> text-red-500, text-gray-900 -> text-primary
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
                // Action Button: text-blue-700/bg-blue-50/hover:bg-blue-100 -> (d) Accent Olive Button style
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-[#0B0B09] bg-[#A6C36F] hover:bg-[#8FAE5D] rounded-2xl transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Payment Proof</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {/* bg-gray-50 -> bg-[#0B0B09], border-gray-200 -> border-[#3A3E36] */}
      <div className="px-6 py-4 bg-[#0B0B09] border-t border-[#3A3E36]">
        {/* text-gray-600 -> text-secondary */}
        <p className="text-xs text-[#E8E3C5] text-center">
          Total Records: <span className="font-semibold">{payments.length}</span>
        </p>
      </div>
    </div>
  );
};

export default PaymentHistoryTable;