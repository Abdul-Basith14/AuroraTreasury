import { X, MessageSquare, Download, CheckCircle } from 'lucide-react';

/**
 * TreasurerResponseModal Component
 * Displays treasurer's response to a reimbursement request
 * Shows message, payment proof photo, and respondent details
 * * @param {Boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback to close modal
 * @param {Object} request - Reimbursement request with treasurer response
 * @param {Function} onConfirmReceipt - Callback to confirm payment receipt
 */
const TreasurerResponseModal = ({ isOpen, onClose, request, onConfirmReceipt }) => {
  if (!isOpen || !request) return null;

  const { treasurerResponse } = request;

  // Format date to Indian locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get status badge styling (Themed)
  const getStatusBadge = (status) => {
    const badges = {
      Approved: `bg-blue-500/10 text-blue-400 border border-blue-500/20`,
      Paid: `bg-yellow-500/10 text-yellow-500 border border-yellow-500/20`,
      Received: `bg-[#A6C36F]/10 text-[#A6C36F] border border-[#A6C36F]/20`,
      Rejected: `bg-red-500/10 text-red-500 border border-red-500/20`,
    };
    return badges[status] || `bg-white/5 text-white/60 border border-white/10`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-black/90 border border-[#A6C36F]/20 rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto backdrop-blur-xl">
          
          {/* Header */}
          <div className="sticky top-0 bg-black/40 border-b border-[#A6C36F]/20 px-6 py-4 rounded-t-2xl flex justify-between items-center z-10 backdrop-blur-md">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 mr-2 text-[#A6C36F]" />
              <h2 className="text-xl font-bold text-[#F5F3E7]">Treasurer Response</h2>
            </div>
            <button
              onClick={onClose}
              className="text-[#E8E3C5] hover:text-[#A6C36F] hover:bg-[#A6C36F]/10 rounded-full p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Success Message */}
            <div className="bg-[#A6C36F]/10 border-l-4 border-[#A6C36F] p-4 rounded-lg">
              <p className="text-[#F5F3E7] font-medium">
                Your reimbursement request has been processed!
              </p>
            </div>

            {/* Request Details */}
            <div className="bg-black/40 rounded-xl p-4 border border-[#A6C36F]/20">
              <h3 className="text-sm font-semibold text-[#E8E3C5]/60 mb-3 uppercase tracking-wide">
                Request Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#E8E3C5]/60">Amount:</span>
                  <span className="font-bold text-[#A6C36F]">₹ {request.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8E3C5]/60">Description:</span>
                  <span className="text-[#F5F3E7] text-right max-w-xs">{request.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8E3C5]/60">Requested on:</span>
                  <span className="text-[#F5F3E7]">{formatDate(request.requestDate)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[#A6C36F]/20"></div>

            {/* Treasurer's Message */}
            {treasurerResponse && treasurerResponse.message && (
              <div>
                <div className="flex items-center mb-3">
                  <MessageSquare className="w-5 h-5 text-[#A6C36F] mr-2" />
                  <h3 className="text-sm font-semibold text-[#E8E3C5]/60 uppercase tracking-wide">
                    Treasurer's Message
                  </h3>
                </div>
                {/* Message Box Themed */}
                <div className="bg-black/40 border-l-4 border-[#A6C36F]/50 p-4 rounded-lg">
                  <p className="text-[#F5F3E7] leading-relaxed">{treasurerResponse.message}</p>
                </div>
              </div>
            )}

            {/* Respondent Details */}
            {treasurerResponse && treasurerResponse.respondedBy && (
              <div className="bg-black/40 rounded-xl p-4 border border-[#A6C36F]/20">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-[#E8E3C5]/60">Responded by:</p>
                    <p className="font-semibold text-[#F5F3E7]">
                      {treasurerResponse.respondedBy.name}
                    </p>
                    <p className="text-xs text-[#E8E3C5]/60">
                      {treasurerResponse.respondedBy.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#E8E3C5]/60">Response Date:</p>
                    <p className="font-medium text-[#F5F3E7]">
                      {formatDate(treasurerResponse.respondedDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-[#A6C36F]/20"></div>

            {/* Payment Proof Photo */}
            {treasurerResponse && treasurerResponse.paymentProofPhoto && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#E8E3C5]/60 uppercase tracking-wide">
                    📸 Payment Proof from Treasurer
                  </h3>
                  <button
                    onClick={() => window.open(treasurerResponse.paymentProofPhoto, '_blank')}
                    className="text-sm text-[#A6C36F] hover:text-[#8FAE5D] font-medium flex items-center transition"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>

                {/* Image Preview */}
                <div className="border border-[#A6C36F]/20 rounded-xl overflow-hidden bg-black/40">
                  <img
                    src={treasurerResponse.paymentProofPhoto}
                    alt="Payment Proof"
                    className="w-full h-auto object-contain max-h-96"
                  />
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="bg-black/40 rounded-xl p-4 border border-[#A6C36F]/20 flex justify-between items-center">
              <p className="text-sm text-[#E8E3C5]/60">Current Status:</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border border-[#A6C36F]/20 text-[#E8E3C5] rounded-xl hover:bg-[#A6C36F]/10 font-semibold transition"
              >
                Close
              </button>

              {/* Show Confirm Receipt button if status is Paid */}
              {request.status === 'Paid' && (
                <button
                  onClick={() => {
                    onConfirmReceipt(request._id);
                    onClose();
                  }}
                  className="px-6 py-2.5 bg-[#A6C36F] text-black rounded-xl hover:bg-[#8FAE5D] font-semibold flex items-center transition shadow-lg hover:shadow-[#A6C36F]/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Confirm Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TreasurerResponseModal;