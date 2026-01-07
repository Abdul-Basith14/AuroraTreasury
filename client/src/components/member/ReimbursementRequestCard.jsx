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
  // Pending: Yellow -> Muted Olive-Gray
  Pending: {
    color: 'gray',
    bg: 'bg-[#3A3E36]',
    text: 'text-[#E8E3C5]',
    border: 'border-[#3A3E36]',
    icon: Clock,
    message: 'Awaiting treasurer review',
  },
  // Approved: Blue -> Accent Olive Muted
  Approved: {
    color: 'olive-light',
    bg: 'bg-[#A6C36F]/30',
    text: 'text-[#A6C36F]',
    border: 'border-[#A6C36F]/40',
    icon: CheckCircle,
    message: 'Approved! Payment in progress',
  },
  // Paid: Green -> Strong Accent Olive
  Paid: {
    color: 'olive-dark',
    bg: 'bg-[#A6C36F]/50',
    text: 'text-[#0B0B09]', // High contrast black text on light olive
    border: 'border-[#A6C36F]/60',
    icon: CheckCircle,
    message: 'Payment sent! Please confirm receipt',
  },
  // Received: Emerald -> Pure Accent Olive
  Received: {
    color: 'olive-full',
    bg: 'bg-[#A6C36F]',
    text: 'text-[#0B0B09]', // High contrast black text on light olive
    border: 'border-[#A6C36F]',
    icon: CheckCircle,
    message: 'Completed',
  },
  // Rejected: Red -> Dark Panel + Soft Red Text
  Rejected: {
    color: 'red-dark',
    bg: 'bg-[#1F221C]',
    text: 'text-[#F07167]',
    border: 'border-[#F07167]/40',
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
    // Base card styling
    <div className={`
      bg-[#1F221C] 
      border-2 ${status.border} 
      rounded-xl p-4
      hover:shadow-[0_0_15px_rgba(166,195,111,0.2)] 
      transition-all duration-200
      cursor-pointer
    `}
    onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Compact Header - Always visible */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Amount */}
          <span className="text-xl font-bold text-[#F5F3E7]">₹ {request.amount.toLocaleString('en-IN')}</span>
          
          {/* Status Badge */}
          <div className={`inline-flex items-center px-2 py-1 rounded-full ${status.bg} ${status.text} text-xs font-semibold`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            <span>{request.status}</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Date */}
          <span className="text-xs text-[#E8E3C5]/70 font-medium">
            {formatDate(request.requestDate)}
          </span>

          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(request._id);
            }}
            className="text-[#F07167] hover:text-[#F07167]/80 p-1.5 rounded-lg hover:bg-[#0B0B09] transition"
            title="Delete Request"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-[#3A3E36] pt-4" onClick={(e) => e.stopPropagation()}>
          {/* Description */}
          <div className="bg-[#0B0B09] rounded-lg p-3 border border-[#3A3E36]">
            <p className="text-sm text-[#E8E3C5] font-medium mb-1">Description:</p>
            <p className="text-sm text-[#F5F3E7] leading-relaxed">{request.description}</p>
          </div>

          {/* Status Message */}
          <div className={`text-xs ${status.text} font-semibold px-2 py-1 rounded ${status.bg} inline-block`}>
            {status.message}
          </div>

          {/* Contact Info */}
          <div className="text-xs text-[#E8E3C5]/70">
            Contact: +91 {request.mobileNumber}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            {/* View Bill Button */}
            <button
              onClick={() => window.open(request.billProofPhoto, '_blank')}
              className="text-xs text-[#A6C36F] hover:text-[#A6C36F] font-medium flex items-center hover:bg-[#3A3E36] px-2 py-1 rounded-lg transition"
            >
              <FileText className="w-3 h-3 mr-1" />
              View Bill
            </button>

            {/* View Treasurer Response */}
            {request.treasurerResponse && request.treasurerResponse.message && (
              <button
                onClick={() => onViewResponse(request)}
                className="text-xs text-[#E8E3C5] hover:text-[#F5F3E7] font-medium flex items-center hover:bg-[#3A3E36] px-2 py-1 rounded-lg transition"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                View Response
              </button>
            )}

            {/* Confirm Receipt Button */}
            {request.status === 'Paid' && (
              <button
                onClick={() => onConfirmReceipt(request._id)}
                className="text-xs bg-[#A6C36F] text-[#0B0B09] px-3 py-1 rounded-lg hover:bg-[#8FAE5D] font-semibold flex items-center shadow-sm hover:shadow transition-all animate-pulse ml-auto"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Confirm Receipt
              </button>
            )}
          </div>
        </div>
      )}
      {/* Rejection Reason - If rejected */}
      {isExpanded && request.status === 'Rejected' && request.rejectionReason && (
        <div className="mt-4 p-3 bg-[#0B0B09] rounded-lg border-l-4 border-[#F07167]" onClick={(e) => e.stopPropagation()}>
          <p className="text-xs font-semibold text-[#F07167] mb-1 uppercase tracking-wide">
            Rejection Reason:
          </p>
          <p className="text-sm text-[#F07167] leading-relaxed">{request.rejectionReason}</p>
        </div>
      )}
    </div>
  );
};

export default ReimbursementRequestCard;