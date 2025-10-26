import { X, MessageSquare, Download, CheckCircle } from 'lucide-react';

/**
 * TreasurerResponseModal Component
 * Displays treasurer's response to a reimbursement request
 * Shows message, payment proof photo, and respondent details
 * 
 * @param {Boolean} isOpen - Modal visibility state
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

  // Get status badge styling
  const getStatusBadge = (status) => {
    const badges = {
      Approved: 'bg-blue-100 text-blue-800',
      Paid: 'bg-green-100 text-green-800',
      Received: 'bg-emerald-100 text-emerald-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center">
              <MessageSquare className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Treasurer Response</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Success Message */}
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
              <p className="text-green-800 font-medium">
                Your reimbursement request has been processed!
              </p>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Request Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">₹{request.amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="text-gray-800 text-right max-w-xs">{request.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Requested on:</span>
                  <span className="text-gray-800">{formatDate(request.requestDate)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200"></div>

            {/* Treasurer's Message */}
            {treasurerResponse && treasurerResponse.message && (
              <div>
                <div className="flex items-center mb-3">
                  <MessageSquare className="w-5 h-5 text-purple-600 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Treasurer's Message
                  </h3>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                  <p className="text-gray-800 leading-relaxed">{treasurerResponse.message}</p>
                </div>
              </div>
            )}

            {/* Respondent Details */}
            {treasurerResponse && treasurerResponse.respondedBy && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-gray-600">Responded by:</p>
                    <p className="font-semibold text-gray-900">
                      {treasurerResponse.respondedBy.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {treasurerResponse.respondedBy.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600">Response Date:</p>
                    <p className="font-medium text-gray-800">
                      {formatDate(treasurerResponse.respondedDate)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t border-gray-200"></div>

            {/* Payment Proof Photo */}
            {treasurerResponse && treasurerResponse.paymentProofPhoto && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    📸 Payment Proof from Treasurer
                  </h3>
                  <button
                    onClick={() => window.open(treasurerResponse.paymentProofPhoto, '_blank')}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                </div>

                {/* Image Preview */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={treasurerResponse.paymentProofPhoto}
                    alt="Payment Proof"
                    className="w-full h-auto object-contain max-h-96 bg-gray-50"
                  />
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">Current Status:</p>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold ${getStatusBadge(request.status)}`}>
                {request.status}
              </span>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition"
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
                  className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center transition shadow-md hover:shadow-lg"
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
