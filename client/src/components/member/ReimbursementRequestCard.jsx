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
  // Pending: Yellow
  Pending: {
    bg: 'bg-yellow-500/10',
    text: 'text-yellow-500',
    border: 'border-yellow-500/20',
    icon: Clock,
    message: 'Awaiting treasurer review',
  },
  // Approved: Blue
  Approved: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/20',
    icon: CheckCircle,
    message: 'Approved! Payment in progress',
  },
  // Paid: Olive
  Paid: {
    bg: 'bg-[#A6C36F]/10',
    text: 'text-[#A6C36F]',
    border: 'border-[#A6C36F]/20',
    icon: CheckCircle,
    message: 'Payment sent! Please confirm receipt',
  },
  // Received: Green
  Received: {
    bg: 'bg-green-500/10',
    text: 'text-green-500',
    border: 'border-green-500/20',
    icon: CheckCircle,
    message: 'Completed',
  },
  // Rejected: Red
  Rejected: {
    bg: 'bg-red-500/10',
    text: 'text-red-500',
    border: 'border-red-500/20',
    icon: XCircle,
    message: 'Request rejected',
  },
};

/**
 * ReimbursementRequestCard Component
 * Displays a single reimbursement request with status, details, and actions
 * * @param {Object} request - Reimbursement request object
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const status = statusConfig[request.status] || statusConfig.Pending;
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
    // Base card styling
    <div className={`
      bg-black/40 backdrop-blur-sm
      border ${status.border} 
      rounded-xl p-4
      hover:shadow-[0_0_15px_rgba(166,195,111,0.1)] 
      transition-all duration-200
      cursor-pointer
      relative
      group
    `}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        {/* Left Section: Icon & Basic Info */}
        <div className="flex items-start space-x-4">
          {/* Status Icon */}
          <div className={`p-3 rounded-lg ${status.bg} ${status.text}`}>
            <StatusIcon className="w-6 h-6" />
          </div>

          <div>
            <h4 className="text-[#F5F3E7] font-semibold text-lg">
              {request.description}
            </h4>
            <div className="flex items-center space-x-3 mt-1 text-sm text-[#E8E3C5]/60">
              <span>{formatDate(request.createdAt)}</span>
              <span>•</span>
              <span className={status.text}>{request.status}</span>
            </div>
          </div>
        </div>

        {/* Right Section: Amount & Actions */}
        <div className="flex items-start space-x-4">
          <div className="text-right">
            <p className="text-xl font-bold text-[#A6C36F]">
              ₹{request.amount.toLocaleString('en-IN')}
            </p>
            {request.billProofPhoto && (
              <a 
                href={request.billProofPhoto} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-[#A6C36F] hover:underline flex items-center justify-end mt-1"
                onClick={(e) => e.stopPropagation()}
              >
                <FileText className="w-3 h-3 mr-1" />
                View Bill
              </a>
            )}
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1 hover:bg-[#A6C36F]/10 rounded-full text-[#E8E3C5]/60 hover:text-[#A6C36F] transition"
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {showActions && (
              <div className="absolute right-0 mt-2 w-48 bg-black border border-[#A6C36F]/20 rounded-lg shadow-xl z-10 py-1 backdrop-blur-xl">
                {request.treasurerResponse && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onViewResponse(request);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#E8E3C5] hover:bg-[#A6C36F]/10 flex items-center"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    View Response
                  </button>
                )}
                
                {request.status === 'Paid' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(false);
                      onConfirmReceipt(request._id);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#A6C36F] hover:bg-[#A6C36F]/10 flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Confirm Receipt
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowActions(false);
                    onDelete(request._id);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-[#A6C36F]/10 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[#E8E3C5]/60 mb-1">Status Message</p>
              <p className="text-[#F5F3E7]">{status.message}</p>
            </div>
            {request.treasurerResponse?.message && (
              <div>
                <p className="text-[#E8E3C5]/60 mb-1">Treasurer Note</p>
                <p className="text-[#F5F3E7] italic">"{request.treasurerResponse.message}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReimbursementRequestCard;