import React, { useState } from 'react';
import { 
  User as UserIcon,
  IndianRupee as CurrencyRupeeIcon,
  Calendar as CalendarIcon,
  FileText as DocumentTextIcon,
  Image as PhotographIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  Clock as ClockIcon,
  Phone as PhoneIcon,
  X as XIcon,
  RotateCcw as ResubmitIcon // Using an icon for resubmission tracking if needed
} from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

const ReimbursementRequestCard = ({ request, onPay, onReject, isResubmission = false }) => {
  const [showBillImage, setShowBillImage] = useState(false);
  const [showPaymentImage, setShowPaymentImage] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  // Themed Status Configuration
  const getStatusConfig = (status, isResubmission) => {
    const baseConfigs = {
      // Pending status for Treasurer action
      'Pending': { 
        bg: 'bg-yellow-900/30', 
        border: 'border-yellow-600/50', 
        text: 'text-yellow-400', 
        icon: ClockIcon,
        badgeBg: 'bg-yellow-800/50',
        actionBg: ACCENT_OLIVE // Use Accent Olive for action button
      },
      // Paid (by treasurer, pending member confirmation)
      'Paid': { 
        bg: 'bg-blue-900/30', 
        border: 'border-blue-600/50', 
        text: 'text-blue-400', 
        icon: CheckCircleIcon,
        badgeBg: 'bg-blue-800/50'
      },
      // Received (member confirmed receipt)
      'Received': { 
        bg: `bg-[${ACCENT_OLIVE}]/20`, 
        border: `border-[${ACCENT_OLIVE}]/70`, 
        text: `text-[${ACCENT_OLIVE}]`, 
        icon: CheckCircleIcon,
        badgeBg: `bg-[${ACCENT_OLIVE}]/30`
      },
      // Rejected by Treasurer
      'Rejected': { 
        bg: 'bg-red-900/30', 
        border: 'border-red-600/50', 
        text: 'text-red-400', 
        icon: XCircleIcon,
        badgeBg: 'bg-red-800/50'
      },
      // Placeholder for Resubmission (if using a different status, like 'Submitted')
      'Submitted': { // Used if the tab passes status: Submitted
        bg: 'bg-purple-900/30', 
        border: 'border-purple-600/50', 
        text: 'text-purple-400', 
        icon: ResubmitIcon,
        badgeBg: 'bg-purple-800/50'
      }
    };

    // Override base config for "Resubmissions" tab view
    if (isResubmission) {
         return {
            ...baseConfigs['Pending'], // May visually treat as Pending, but flag as Resubmit
            text: 'text-purple-400', 
            icon: ResubmitIcon,
            badgeBg: 'bg-purple-800/50'
         };
    }
    
    return baseConfigs[status] || baseConfigs['Pending'];
  };
  
  const statusConfig = getStatusConfig(request.status, isResubmission);
  const StatusIcon = statusConfig.icon;
  
  // Function to handle image modal display
  const handleShowFullImage = (photoUrl) => {
    // Set the state based on which image is being shown
    if (photoUrl === request.billProofPhoto) {
      setShowFullImage(true);
      setShowPaymentImage(false);
    } else if (photoUrl === request.treasurerResponse?.paymentProofPhoto) {
      setShowPaymentImage(true);
      setShowFullImage(false);
    }
  };

  const handleCloseImage = () => {
    setShowFullImage(false);
    setShowPaymentImage(false);
  };
  
  return (
    <>
      {/* Card Container - uses Panel background, border, and glow */}
      <div className={`
        border-2 ${statusConfig.border} 
        bg-[${BACKGROUND_SECONDARY}] 
        rounded-2xl p-6 
        transition 
        hover:${SHADOW_GLOW}
        relative
      `}>
        
        {/* Header - Member Info */}
        <div className="flex items-start justify-between mb-4 border-b border-[${BORDER_DIVIDER}]/50 pb-4">
          <div className="flex items-center space-x-3">
            {request.userId.profilePhoto ? (
              <img
                src={request.userId.profilePhoto}
                alt={request.userId.name}
                className={`w-14 h-14 rounded-full object-cover border-2 border-[${ACCENT_OLIVE}]/40`}
              />
            ) : (
              // Themed placeholder
              <div className={`w-14 h-14 rounded-full bg-[${ACCENT_OLIVE}]/10 flex items-center justify-center`}>
                <UserIcon className={`w-7 h-7 text-[${ACCENT_OLIVE}]`} />
              </div>
            )}
            <div>
              <h3 className={`font-bold text-[${TEXT_PRIMARY}] text-lg`}>{request.userId.name}</h3>
              <p className={`text-sm text-[${TEXT_SECONDARY}]/80`}>{request.userId.usn}</p>
              <p className={`text-xs text-[${TEXT_SECONDARY}]/60`}>{request.userId.year} • {request.userId.branch}</p>
            </div>
          </div>
          
          {/* Status Badge - Themed dynamically */}
          <span className={`
            px-3 py-1.5 rounded-full text-xs font-bold flex items-center 
            ${statusConfig.badgeBg} ${statusConfig.text} 
            border border-[${statusConfig.border}]
          `}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {isResubmission ? 'Resubmitted' : request.status}
          </span>
        </div>
        
        {/* Amount - Highlighted Accent Olive (Primary Number Display Rule) */}
        <div className={`bg-[${ACCENT_OLIVE}]/20 rounded-xl p-4 mb-4 ring-1 ring-[${ACCENT_OLIVE}]/50`}>
          <p className={`text-xs text-[${TEXT_SECONDARY}]/90 mb-1`}>Reimbursement Amount</p>
          <div className={`flex items-center text-4xl font-bold text-[${ACCENT_OLIVE}]`}>
            <CurrencyRupeeIcon className="w-8 h-8 mr-1" />
            {request.amount}
          </div>
        </div>
        
        {/* Details Section */}
        <div className="space-y-3 mb-4">
          {/* Description - Themed background for inner panel element */}
          <div className={`flex items-start bg-[${BORDER_DIVIDER}]/30 rounded-xl p-3`}>
            <DocumentTextIcon className={`w-5 h-5 text-[${TEXT_SECONDARY}]/60 mr-2 mt-0.5 flex-shrink-0`} />
            <div className="flex-1">
              <p className={`text-xs font-medium text-[${TEXT_SECONDARY}]/80 mb-1`}>Purchase Description:</p>
              <p className={`text-sm text-[${TEXT_PRIMARY}]`}>{request.description}</p>
            </div>
          </div>
          
          {/* Request Date */}
          <div className={`flex items-center text-sm text-[${TEXT_SECONDARY}]`}>
            <CalendarIcon className={`w-4 h-4 mr-2 text-[${ACCENT_OLIVE}]/80`} />
            <span>Requested: {new Date(request.requestDate).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          
          {/* Mobile Number */}
          {request.userId.mobileNumber && (
            <div className={`flex items-center text-sm text-[${TEXT_SECONDARY}]`}>
              <PhoneIcon className={`w-4 h-4 mr-2 text-blue-400`} />
              <span>{request.userId.mobileNumber}</span>
            </div>
          )}
          
          {/* Bill Proof */}
          {request.billProofPhoto && (
            <div className={`bg-[${BORDER_DIVIDER}]/30 rounded-xl p-3`}>
              <p className={`text-xs font-medium text-[${TEXT_SECONDARY}] mb-2 flex items-center`}>
                <PhotographIcon className={`w-4 h-4 mr-1 text-[${ACCENT_OLIVE}]/80`} />
                Bill Proof
              </p>
              <div className="relative">
                <button
                  onClick={() => handleShowFullImage(request.billProofPhoto)}
                  className="aspect-[3/2] w-full rounded-xl overflow-hidden hover:opacity-90 transition relative border border-[${BORDER_DIVIDER}]/50"
                >
                  <img
                    src={request.billProofPhoto}
                    alt="Bill Proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 hover:opacity-100">
                      Click to view full size
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}
          
          {/* Treasurer's Payment Proof (if paid) */}
          {request.treasurerResponse?.paymentProofPhoto && (
            <div className={`bg-blue-900/30 rounded-xl p-3 border border-blue-600/50`}>
              <p className={`text-xs font-medium text-blue-400 mb-2 flex items-center`}>
                <PhotographIcon className="w-4 h-4 mr-1" />
                Payment Proof • {new Date(request.treasurerResponse.respondedDate).toLocaleDateString()}
              </p>
              <div className="relative">
                <button
                  onClick={() => handleShowFullImage(request.treasurerResponse.paymentProofPhoto)}
                  className="aspect-[3/2] w-full rounded-xl overflow-hidden hover:opacity-90 transition relative border border-[${BORDER_DIVIDER}]/50"
                >
                  <img
                    src={request.treasurerResponse.paymentProofPhoto}
                    alt="Payment Proof"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition flex items-center justify-center">
                    <span className="text-white text-sm font-medium opacity-0 hover:opacity-100">
                      Click to view full size
                    </span>
                  </div>
                </button>
              </div>
              {request.treasurerResponse.message && (
                <p className={`text-sm text-blue-300 mt-2`}>
                  💬 {request.treasurerResponse.message}
                </p>
              )}
            </div>
          )}
          
          {/* Rejection Reason (if rejected or is a resubmission showing history) */}
          {(request.status === 'Rejected' || isResubmission) && request.rejectionReason && (
            <div className={`bg-red-900/30 rounded-xl p-3 border border-red-600/50`}>
              <p className={`text-xs font-medium text-red-400 mb-1`}>
                {isResubmission ? 'Previous Rejection Reason:' : 'Rejection Reason:'}
              </p>
              <p className={`text-sm text-red-300`}>{request.rejectionReason}</p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {(request.status === 'Pending' || isResubmission) && (
          <div className="flex space-x-3 pt-4 border-t border-[${BORDER_DIVIDER}]/50">
            {/* Pay Button - Themed Primary Button */}
            <button
              onClick={() => onPay(request)}
              className={`flex-1 px-4 py-2 bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] rounded-2xl font-semibold hover:bg-[#8FAE5D] transition flex items-center justify-center`}
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Pay & Upload Proof
            </button>
            {/* Reject Button - Themed Secondary Button */}
            <button
              onClick={() => onReject(request)}
              className={`flex-1 px-4 py-2 bg-[${BORDER_DIVIDER}]/50 text-[${TEXT_SECONDARY}] rounded-2xl font-semibold hover:bg-[${BORDER_DIVIDER}]/80 transition flex items-center justify-center`}
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
      
      {/* Full Image Modal - Consolidated Logic */}
      {(showFullImage || showPaymentImage) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={handleCloseImage}
        >
          <div className="relative max-w-6xl w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleCloseImage}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70 z-50"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <img
              src={showFullImage ? request.billProofPhoto : request.treasurerResponse.paymentProofPhoto}
              alt={showFullImage ? "Bill Proof" : "Payment Proof"}
              className="w-full h-auto rounded-lg shadow-2xl max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReimbursementRequestCard;