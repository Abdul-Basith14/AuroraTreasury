import { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  MessageSquare, 
  MoreVertical, 
  Trash2 
} from 'lucide-react';

/**
 * Status configuration for different reimbursement states
 */
const statusConfig = {
  Pending: {
    color: 'yellow',
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-200',
    icon: Clock,
    message: 'Awaiting treasurer review',
  },
  Approved: {
    color: 'blue',
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-200',
    icon: CheckCircle,
    message: 'Approved! Payment in progress',
  },
  Paid: {
    color: 'green',
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
    icon: CheckCircle,
    message: 'Payment sent! Please confirm receipt',
  },
  Received: {
    color: 'emerald',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    icon: CheckCircle,
    message: 'Completed',
  },
  Rejected: {
    color: 'red',
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
    icon: XCircle,
    message: 'Request rejected',
  },
};

/**
 * ReimbursementRequestCard Component
 * Displays a single reimbursement request with status, details, and actions
 * 
 * @param {Object} request - Reimbursement request object
 * @param {Function} onViewResponse - Callback to view treasurer's response
 * @param {Function} onConfirmReceipt - Callback to confirm payment receipt
 * @param {Function} onDelete - Callback to delete request
 */
const ReimbursementRequestCard = ({ 
  request, 
  onViewResponse, 
  onConfirmReceipt, 
  onDelete 
}) => {
  const [showActions, setShowActions] = useState(false);
  
  const status = statusConfig[request.status];
  const StatusIcon = status.icon;

  // Format date to Indian locale
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className={`border-2 ${status.border} rounded-xl p-5 hover:shadow-md transition-all duration-200`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className={`inline-flex items-center px-3 py-1.5 rounded-full ${status.bg} ${status.text} text-xs font-semibold`}>
          <StatusIcon className="w-4 h-4 mr-1.5" />
          <span>{request.status}</span>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {formatDate(request.requestDate)}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-3 mb-4">
        {/* Amount */}
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-gray-900">₹{request.amount.toLocaleString('en-IN')}</span>
          <span className={`text-xs ${status.text} font-semibold px-2 py-1 rounded ${status.bg}`}>
            {status.message}
          </span>
        </div>

        {/* Description */}
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-600 font-medium mb-1">Description:</p>
          <p className="text-sm text-gray-800 leading-relaxed">{request.description}</p>
        </div>

        {/* Mobile Number */}
        <div className="flex items-center text-sm">
          <span className="text-gray-600 font-medium">Contact:</span>
          <span className="text-gray-800 ml-2">+91 {request.mobileNumber}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center flex-wrap gap-3 pt-4 border-t border-gray-200">
        {/* View Bill Button */}
        <button
          onClick={() => window.open(request.billProofPhoto, '_blank')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center hover:bg-blue-50 px-3 py-1.5 rounded-lg transition"
        >
          <FileText className="w-4 h-4 mr-1.5" />
          View Bill
        </button>

        {/* View Treasurer Response - Only if response exists */}
        {request.treasurerResponse && request.treasurerResponse.message && (
          <button
            onClick={() => onViewResponse(request)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium flex items-center hover:bg-purple-50 px-3 py-1.5 rounded-lg transition"
          >
            <MessageSquare className="w-4 h-4 mr-1.5" />
            View Response
          </button>
        )}

        {/* Confirm Receipt Button - Only if status is 'Paid' */}
        {request.status === 'Paid' && (
          <button
            onClick={() => onConfirmReceipt(request._id)}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold flex items-center shadow-sm hover:shadow transition-all animate-pulse"
          >
            <CheckCircle className="w-4 h-4 mr-1.5" />
            Confirm Receipt
          </button>
        )}

        {/* Delete Button - Only if Pending or Rejected */}
        {(request.status === 'Pending' || request.status === 'Rejected') && (
          <div className="ml-auto relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="text-gray-600 hover:text-gray-800 p-2 rounded-lg hover:bg-gray-100 transition"
              title="More actions"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showActions && (
              <>
                {/* Backdrop to close dropdown */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowActions(false)}
                ></div>

                {/* Dropdown Content */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                  <button
                    onClick={() => {
                      onDelete(request._id);
                      setShowActions(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center transition font-medium"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Request
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Rejection Reason - If rejected */}
      {request.status === 'Rejected' && request.rejectionReason && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
          <p className="text-xs font-semibold text-red-800 mb-1 uppercase tracking-wide">
            Rejection Reason:
          </p>
          <p className="text-sm text-red-700 leading-relaxed">{request.rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default ReimbursementRequestCard;
