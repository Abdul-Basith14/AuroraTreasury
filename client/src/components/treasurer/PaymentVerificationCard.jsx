import { useState } from 'react';
import { CheckCircle, XCircle, Copy, AlertTriangle, Calendar, User, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { verifyPayment, rejectPayment } from '../../utils/treasurerAPI';

/**
 * PaymentVerificationCard Component
 * Shows payment details with reference code for treasurer verification
 * 
 * @param {Object} payment - Payment object with reference code
 * @param {Function} onVerified - Callback after verification
 */
const PaymentVerificationCard = ({ payment, onVerified }) => {
  const [verifying, setVerifying] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  /**
   * Copy reference code to clipboard
   */
  const copyReference = () => {
    navigator.clipboard.writeText(payment.paymentReference);
    toast.success('Reference code copied!');
  };

  /**
   * Verify payment (approve)
   */
  const handleVerify = async () => {
    try {
      setVerifying(true);
      await verifyPayment(payment._id);
      toast.success('Payment verified successfully');
      onVerified && onVerified();
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  /**
   * Reject payment
   */
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      setVerifying(true);
      await rejectPayment(payment._id, { reason: rejectReason });
      toast.success('Payment rejected');
      setShowRejectModal(false);
      onVerified && onVerified();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setVerifying(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-black/70 border border-[#A6C36F]/25 rounded-xl p-6 hover:border-[#A6C36F]/50 transition-all">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#A6C36F]/10 rounded-lg">
              <User className="w-5 h-5 text-[#A6C36F]" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F5F3E7]">
                {payment.userId?.name || 'Unknown'}
              </h3>
              <p className="text-sm text-[#E8E3C5]/70">
                {payment.userId?.usn || 'N/A'} · {payment.userId?.email || 'Email unavailable'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#A6C36F]">
              ₹{payment.amount}
            </div>
            <div className="text-xs text-[#E8E3C5]/70">
              {payment.month} {payment.year}
            </div>
          </div>
        </div>

        {/* Reference Code - Highlighted */}
        <div className="mb-4 p-4 bg-[#1A1C17] border-2 border-[#A6C36F]/40 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-xs text-[#A6C36F] mb-1 font-semibold">
                PAYMENT REFERENCE CODE
              </div>
              <code className="text-sm text-[#F5F3E7] font-mono bg-black/40 px-3 py-1.5 rounded inline-block">
                {payment.paymentReference}
              </code>
            </div>
            <button
              onClick={copyReference}
              className="ml-3 p-2 text-[#A6C36F] hover:text-black hover:bg-[#A6C36F]/80 rounded-lg transition-colors"
              title="Copy reference"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-3 text-xs text-[#E8E3C5]/70">
            <AlertTriangle className="w-3 h-3 inline mr-1 text-[#A6C36F]" />
            Match on amount ₹{payment.amount} and this reference in your bank/UPI statement.
          </div>
        </div>

        {/* Payment Details */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[#E8E3C5]/70" />
            <div>
              <div className="text-xs text-[#E8E3C5]/60">Member Confirmed</div>
              <div className="text-[#F5F3E7]">
                {payment.memberConfirmedDate ? formatDate(payment.memberConfirmedDate) : 'N/A'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-[#E8E3C5]/70" />
            <div>
              <div className="text-xs text-[#E8E3C5]/60">Method</div>
              <div className="text-[#F5F3E7]">{payment.paymentMethod || 'UPI'}</div>
            </div>
          </div>
        </div>

        {/* Bank matching hint */}
        <div className="mb-4 p-3 bg-[#0F100D] border border-[#A6C36F]/25 rounded-lg text-xs text-[#E8E3C5]/80">
          Check your bank/UPI app for a transaction with note/reference <span className="font-mono text-[#A6C36F]">{payment.paymentReference}</span> and amount ₹{payment.amount}. If it matches, approve; otherwise reject with reason.
        </div>

        {/* Status */}
        <div className="mb-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            payment.status === 'AwaitingVerification'
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
              : payment.status === 'Paid'
              ? 'bg-green-500/10 text-green-400 border border-green-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}>
            {payment.status}
          </span>
        </div>

        {/* Action Buttons */}
        {payment.status === 'AwaitingVerification' && (
          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(166,195,111,0.4)]"
            >
              <CheckCircle className="w-4 h-4" />
              Verify & Approve
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={verifying}
              className="flex-1 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              Reject
            </button>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-black/85 border border-red-500/30 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-[#F5F3E7] mb-4">Reject Payment</h3>
            <p className="text-[#E8E3C5]/70 mb-4 text-sm">
              Please provide a reason for rejecting this payment:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-4 py-3 bg-black/30 border border-[#A6C36F]/30 rounded-lg text-[#F5F3E7] placeholder-[#E8E3C5]/50 focus:outline-none focus:border-[#A6C36F]/50 mb-4"
              rows={4}
              placeholder="e.g., Reference not found in bank statement, Amount mismatch, etc."
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2 px-4 bg-[#1A1C17] hover:bg-[#2A2D24] text-[#E8E3C5]/80 font-semibold rounded-lg transition-colors border border-[#A6C36F]/20"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={verifying || !rejectReason.trim()}
                className="flex-1 py-2 px-4 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentVerificationCard;
