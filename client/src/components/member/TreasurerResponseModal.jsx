import { X, MessageSquare, Download, CheckCircle } from 'lucide-react';

// --- Theme Colors ---
const MODAL_BG = '#1F221C'; // Primary Dark BG for the modal body
const ACCENT_OLIVE = '#A6C36F'; // Primary accent color
const ACCENT_HOVER = '#8FAE5D';
const TEXT_LIGHT = '#E8E3C5'; // Light text for dark background
const TEXT_MUTED = '#9CA3AF'; // Muted gray text
const BORDER_DARK = '#3A3E36'; // Dark border/divider

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
      Approved: `bg-blue-900 text-blue-300`, // Blue for Approval
      Paid: `bg-yellow-900 text-yellow-300`, // Yellow for Paid/Pending receipt
      Received: `bg-[${ACCENT_OLIVE}] bg-opacity-30 text-[${ACCENT_OLIVE}]`, // Olive for success/completion
      Rejected: `bg-red-900 text-red-300`, // Added Rejected for completeness
    };
    return badges[status] || `bg-[${BORDER_DARK}] text-[${TEXT_LIGHT}]`;
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-70 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className={`bg-[${MODAL_BG}] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[${BORDER_DARK}]`}>
          
          {/* Header */}
          <div className={`sticky top-0 bg-[${BORDER_DARK}] text-[${TEXT_LIGHT}] px-6 py-4 rounded-t-2xl flex justify-between items-center border-b border-[#4E524A]`}>
            <div className="flex items-center">
              <MessageSquare className={`w-6 h-6 mr-2 text-[${ACCENT_OLIVE}]`} />
              <h2 className="text-xl font-bold">Treasurer Response</h2>
            </div>
            <button
              onClick={onClose}
              className={`text-[${TEXT_LIGHT}] hover:bg-white hover:bg-opacity-10 rounded-lg p-2 transition`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            
            {/* Success Message */}
            <div className={`bg-[${ACCENT_OLIVE}] bg-opacity-10 border-l-4 border-[${ACCENT_OLIVE}] p-4 rounded-lg`}>
              <p className={`text-[${TEXT_LIGHT}] font-medium`}>
                Your reimbursement request has been processed!
              </p>
            </div>

            {/* Request Details */}
            <div className={`bg-[${BORDER_DARK}] rounded-lg p-4 border border-[#4E524A]`}>
              <h3 className={`text-sm font-semibold text-[${TEXT_MUTED}] mb-3 uppercase tracking-wide`}>
                Request Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`text-[${TEXT_MUTED}]`}>Amount:</span>
                  <span className={`font-bold text-[${TEXT_LIGHT}]`}>₹ {request.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[${TEXT_MUTED}]`}>Description:</span>
                  <span className={`text-[${TEXT_LIGHT}] text-right max-w-xs`}>{request.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`text-[${TEXT_MUTED}]`}>Requested on:</span>
                  <span className={`text-[${TEXT_LIGHT}]`}>{formatDate(request.requestDate)}</span>
                </div>
              </div>
            </div>

            <div className={`border-t border-[${BORDER_DARK}]`}></div>

            {/* Treasurer's Message */}
            {treasurerResponse && treasurerResponse.message && (
              <div>
                <div className="flex items-center mb-3">
                  <MessageSquare className={`w-5 h-5 text-[${ACCENT_OLIVE}] mr-2`} />
                  <h3 className={`text-sm font-semibold text-[${TEXT_MUTED}] uppercase tracking-wide`}>
                    Treasurer's Message
                  </h3>
                </div>
                {/* Message Box Themed */}
                <div className={`bg-gray-700 bg-opacity-30 border-l-4 border-gray-600 p-4 rounded-lg`}>
                  <p className={`text-[${TEXT_LIGHT}] leading-relaxed`}>{treasurerResponse.message}</p>
                </div>
              </div>
            )}

            {/* Respondent Details */}
            {treasurerResponse && treasurerResponse.respondedBy && (
              <div className={`bg-[${BORDER_DARK}] rounded-lg p-4 border border-[#4E524A]`}>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className={`text-[${TEXT_MUTED}]`}>Responded by:</p>
                    <p className={`font-semibold text-[${TEXT_LIGHT}]`}>
                      {treasurerResponse.respondedBy.name}
                    </p>
                    <p className={`text-xs text-[${TEXT_MUTED}]`}>
                      {treasurerResponse.respondedBy.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[${TEXT_MUTED}]`}>Response Date:</p>
                    <p className={`font-medium text-[${TEXT_LIGHT}]`}>
                      {formatDate(treasurerResponse.respondedDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`border-t border-[${BORDER_DARK}]`}></div>

            {/* Payment Proof Photo */}
            {treasurerResponse && treasurerResponse.paymentProofPhoto && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-sm font-semibold text-[${TEXT_MUTED}] uppercase tracking-wide`}>
                    📸 Payment Proof from Treasurer
                  </h3>
                  <button
                    onClick={() => window.open(treasurerResponse.paymentProofPhoto, '_blank')}
                    className={`text-sm text-[${ACCENT_OLIVE}] hover:text-[${ACCENT_HOVER}] font-medium flex items-center transition`}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>

                {/* Image Preview */}
                <div className={`border-2 border-[${BORDER_DARK}] rounded-lg overflow-hidden`}>
                  <img
                    src={treasurerResponse.paymentProofPhoto}
                    alt="Payment Proof"
                    className={`w-full h-auto object-contain max-h-96 bg-[${BORDER_DARK}]`}
                  />
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className={`bg-[${BORDER_DARK}] rounded-lg p-4 border border-[#4E524A]`}>
              <p className={`text-sm text-[${TEXT_MUTED}] mb-2`}>Current Status:</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className={`px-6 py-2.5 border-2 border-[${BORDER_DARK}] text-[${TEXT_LIGHT}] rounded-lg hover:bg-[#3A3E36] font-semibold transition`}
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
                  className={`px-6 py-2.5 bg-[${ACCENT_OLIVE}] text-black rounded-lg hover:bg-[${ACCENT_HOVER}] font-semibold flex items-center transition shadow-md hover:shadow-lg`}
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