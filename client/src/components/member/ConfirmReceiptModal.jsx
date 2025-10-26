import { X, CheckCircle, AlertTriangle } from 'lucide-react';

/**
 * ConfirmReceiptModal Component
 * Confirmation dialog for members to confirm they received payment from treasurer
 * 
 * @param {Boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onConfirm - Callback to confirm receipt
 * @param {Object} request - Reimbursement request object
 * @param {Boolean} loading - Loading state during confirmation
 */
const ConfirmReceiptModal = ({ isOpen, onClose, onConfirm, request, loading }) => {
  if (!isOpen || !request) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center">
            <div className="flex items-center">
              <CheckCircle className="w-6 h-6 mr-2" />
              <h2 className="text-xl font-bold">Confirm Receipt</h2>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            {/* Info Message */}
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg flex">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">
                  Important Confirmation
                </p>
                <p className="text-sm text-yellow-700">
                  Please confirm only after you have received the payment from the treasurer.
                </p>
              </div>
            </div>

            {/* Request Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                Request Details
              </h3>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-gray-900">₹{request.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Description:</span>
                <span className="text-gray-800 text-right max-w-xs">{request.description.substring(0, 50)}{request.description.length > 50 ? '...' : ''}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-700">Paid</span>
              </div>
            </div>

            {/* Confirmation Question */}
            <div className="text-center py-2">
              <p className="text-gray-800 font-medium text-lg">
                Have you received ₹{request.amount.toLocaleString('en-IN')} from the treasurer?
              </p>
            </div>

            {/* Checklist */}
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-blue-900 mb-2">Before confirming, verify:</p>
              <ul className="space-y-1.5 text-sm text-blue-800">
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>The correct amount has been received</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Payment has been credited to your account</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>This action cannot be undone</span>
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(request._id)}
                disabled={loading}
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Yes, I Received It
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConfirmReceiptModal;
