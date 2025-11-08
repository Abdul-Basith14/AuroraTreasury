import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  UserCircle,
  Camera,
  Calendar,
  IndianRupee,
  Clock, // Added Clock for Pending status icon
  AlertCircle // Added AlertCircle for Rejected status icon
} from 'lucide-react';
import VerifyPaymentModal from './VerifyPaymentModal';
import RejectPaymentModal from './RejectPaymentModal';

// --- Theme Tokens (These should be defined or imported where the component is used, but defined here for context) ---
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// --------------------

/**
 * Payment Request Card - Displays individual payment request with actions
 */
const PaymentRequestCard = ({ request, onActionComplete, isResubmission }) => {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Get the appropriate payment proof photo
  const paymentProofPhoto = isResubmission
    ? request.failedPaymentSubmission?.resubmittedPhoto
    : request.paymentProof;

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get submission date
  const submissionDate = isResubmission
    ? request.failedPaymentSubmission?.resubmittedDate
    : request.submittedDate;

  // Status Badge Theming Logic
  const getStatusTheme = (status) => {
    switch (status) {
      case 'Pending':
        return {
          bg: 'bg-yellow-800/20',
          text: 'text-yellow-400',
          icon: Clock,
        };
      case 'Paid':
        return {
          bg: `bg-[${ACCENT_OLIVE}]/10`,
          text: `text-[${ACCENT_OLIVE}]`,
          icon: CheckCircle,
        };
      case 'Rejected':
        return {
          bg: 'bg-red-800/20',
          text: 'text-red-400',
          icon: AlertCircle,
        };
      default:
        return {
          bg: `bg-[${BORDER_DIVIDER}]/40`,
          text: `text-[${TEXT_SECONDARY}]/70`,
          icon: Clock,
        };
    }
  };

  const statusTheme = getStatusTheme(request.status);
  const StatusIcon = statusTheme.icon;

  return (
    <>
      <div 
        className={`bg-[${BACKGROUND_SECONDARY}] rounded-2xl ${SHADOW_GLOW} ring-1 ring-[${BORDER_DIVIDER}]/40 transition-shadow overflow-hidden`}
      >
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            
            {/* Left Section - Member Info */}
            <div className="flex items-start space-x-4 flex-1">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {request.userId?.profilePhoto ? (
                  <img
                    src={request.userId.profilePhoto}
                    alt={request.userId.name}
                    className={`w-16 h-16 rounded-full object-cover border-2 border-[${ACCENT_OLIVE}]/50`}
                  />
                ) : (
                  <UserCircle className={`w-16 h-16 text-[${BORDER_DIVIDER}]`} />
                )}
              </div>

              {/* Member Details */}
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold text-[${TEXT_PRIMARY}] truncate`}>
                  {request.userId?.name || 'Unknown'}
                </h3>
                <p className={`text-sm text-[${TEXT_SECONDARY}]/80`}>{request.userId?.usn || 'N/A'}</p>
                <p className={`text-sm text-[${TEXT_SECONDARY}]/80`}>{request.userId?.email || 'N/A'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${ACCENT_OLIVE}]/10 text-[${ACCENT_OLIVE}]`}>
                    {request.userId?.year || 'N/A'} Year
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[${BORDER_DIVIDER}]/50 text-[${TEXT_SECONDARY}]/80`}>
                    {request.userId?.branch || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section - Payment Details */}
            <div className="flex-1 space-y-3">
              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusTheme.bg} ${statusTheme.text}`}>
                  <StatusIcon className="w-3.5 h-3.5 mr-1" />
                  {isResubmission ? 'Resubmitted' : request.status || 'Unknown'}
                </span>
              </div>

              <div className={`flex items-center space-x-2 text-[${TEXT_SECONDARY}]/90`}>
                <Calendar className={`w-5 h-5 text-[${ACCENT_OLIVE}]/70`} />
                <div>
                  <p className="text-sm font-medium">Payment Month</p>
                  <p className="text-sm">{request.month || 'N/A'} {request.year || ''}</p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-2 text-[${TEXT_SECONDARY}]/90`}>
                <IndianRupee className={`w-5 h-5 text-[${ACCENT_OLIVE}]`} />
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className={`text-lg font-semibold text-[${ACCENT_OLIVE}]`}>
                    ₹{request.amount || 0}
                  </p>
                </div>
              </div>

              <div className={`flex items-center space-x-2 text-[${TEXT_SECONDARY}]/90`}>
                <Calendar className={`w-5 h-5 text-[${ACCENT_OLIVE}]/70`} />
                <div>
                  <p className="text-sm font-medium">Submitted On</p>
                  <p className="text-sm">{formatDate(submissionDate)}</p>
                </div>
              </div>

              {isResubmission && request.rejectionReason && (
                <div className={`mt-3 p-3 bg-red-800/20 rounded-lg border border-red-700/50`}>
                  <p className="text-sm font-medium text-red-400 mb-1">
                    Previous Rejection Reason:
                  </p>
                  <p className="text-sm text-red-300">{request.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Right Section - Payment Proof */}
            <div className="flex-shrink-0">
              <div className="w-48">
                <p className={`text-sm font-medium text-[${TEXT_SECONDARY}] mb-2 flex items-center`}>
                  <Camera className={`w-4 h-4 mr-1 text-[${ACCENT_OLIVE}]`} />
                  Payment Proof
                </p>
                {paymentProofPhoto ? (
                  <div
                    onClick={() => setImageModalOpen(true)}
                    className="cursor-pointer group relative"
                  >
                    <img
                      src={paymentProofPhoto}
                      alt="Payment Proof"
                      className={`w-full h-32 object-cover rounded-lg border-2 border-[${BORDER_DIVIDER}] group-hover:border-[${ACCENT_OLIVE}] transition`}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition flex items-center justify-center">
                      <span className={`text-white opacity-0 group-hover:opacity-100 text-sm font-medium`}>
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-full h-32 bg-[${BORDER_DIVIDER}]/50 rounded-lg flex items-center justify-center`}>
                    <p className={`text-sm text-[${TEXT_SECONDARY}]/60`}>No proof uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`mt-6 flex justify-end space-x-3 pt-4 border-t border-[${BORDER_DIVIDER}]`}>
            {/* Reject Button (Danger Red) */}
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 font-medium"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>
            {/* Verify & Approve Button (Olive Accent) */}
            <button
              onClick={() => setShowVerifyModal(true)}
              className={`px-6 py-2.5 bg-[${ACCENT_OLIVE}] text-[${BACKGROUND_PRIMARY}] rounded-lg hover:bg-[#8FAE5D] transition flex items-center space-x-2 font-medium`}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Verify & Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal (Themed) */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={paymentProofPhoto}
              alt="Payment Proof"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            <button
              onClick={() => setImageModalOpen(false)}
              className={`absolute top-4 right-4 bg-[${BACKGROUND_SECONDARY}] rounded-full p-2 ring-1 ring-[${BORDER_DIVIDER}]/50 hover:bg-[${BORDER_DIVIDER}] transition`}
            >
              <XCircle className={`w-6 h-6 text-[${TEXT_SECONDARY}]`} />
            </button>
          </div>
        </div>
      )}

      {/* Verify Modal (Assumes VerifyPaymentModal is themed separately) */}
      {showVerifyModal && (
        <VerifyPaymentModal
          request={request}
          isResubmission={isResubmission}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={onActionComplete}
        />
      )}

      {/* Reject Modal (Assumes RejectPaymentModal is themed separately) */}
      {showRejectModal && (
        <RejectPaymentModal
          request={request}
          isResubmission={isResubmission}
          onClose={() => setShowRejectModal(false)}
          onSuccess={onActionComplete}
        />
      )}
    </>
  );
};

export default PaymentRequestCard;