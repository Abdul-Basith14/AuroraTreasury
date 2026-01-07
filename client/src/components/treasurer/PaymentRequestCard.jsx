import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  UserCircle,
  Camera,
  Calendar,
  IndianRupee,
  Clock,
  AlertCircle
} from 'lucide-react';
import VerifyPaymentModal from './VerifyPaymentModal';
import RejectPaymentModal from './RejectPaymentModal';

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
          bg: 'bg-[#A6C36F]/10',
          text: 'text-[#A6C36F]',
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
          bg: 'bg-[#3A3E36]/40',
          text: 'text-[#E8E3C5]/70',
          icon: Clock,
        };
    }
  };

  const statusTheme = getStatusTheme(request.status);
  const StatusIcon = statusTheme.icon;

  return (
    <>
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20 transition-shadow overflow-hidden">
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
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#A6C36F]/50"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-[#3A3E36]" />
                )}
              </div>

              {/* Member Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-[#F5F3E7] truncate">
                  {request.userId?.name || 'Unknown'}
                </h3>
                <p className="text-sm text-[#E8E3C5]/80">{request.userId?.usn || 'N/A'}</p>
                <p className="text-sm text-[#E8E3C5]/80">{request.userId?.email || 'N/A'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A6C36F]/10 text-[#A6C36F]">
                    {request.userId?.year || 'N/A'} Year
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3A3E36]/50 text-[#E8E3C5]/80">
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

              <div className="flex items-center space-x-2 text-[#E8E3C5]/90">
                <Calendar className="w-5 h-5 text-[#A6C36F]/70" />
                <div>
                  <p className="text-sm font-medium">Payment Month</p>
                  <p className="text-sm">{request.month || 'N/A'} {request.year || ''}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-[#E8E3C5]/90">
                <IndianRupee className="w-5 h-5 text-[#A6C36F]" />
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-lg font-semibold text-[#A6C36F]">
                    ₹{request.amount || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[#E8E3C5]/90">
                <Calendar className="w-5 h-5 text-[#A6C36F]/70" />
                <div>
                  <p className="text-sm font-medium">Submitted On</p>
                  <p className="text-sm">{formatDate(submissionDate)}</p>
                </div>
              </div>

              {isResubmission && request.rejectionReason && (
                <div className="mt-3 p-3 bg-red-800/20 rounded-lg border border-red-700/50">
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
                <p className="text-sm font-medium text-[#E8E3C5] mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-1 text-[#A6C36F]" />
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
                      className="w-full h-32 object-cover rounded-lg border-2 border-[#3A3E36] group-hover:border-[#A6C36F] transition"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-lg transition flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-[#3A3E36]/50 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-[#E8E3C5]/60">No proof uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-[#A6C36F]/20">
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
              className="px-6 py-2.5 bg-[#A6C36F] text-black rounded-lg hover:bg-[#8FAE5D] transition flex items-center space-x-2 font-medium"
            >
              <CheckCircle className="w-5 h-5" />
              <span>Verify & Approve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {imageModalOpen && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setImageModalOpen(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={paymentProofPhoto}
              alt="Payment Proof"
              className="max-w-full max-h-[90vh] object-contain rounded-lg border border-[#A6C36F]/20"
            />
            <button
              onClick={() => setImageModalOpen(false)}
              className="absolute top-4 right-4 bg-black/60 rounded-full p-2 hover:bg-black/80 transition text-[#F5F3E7]"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Verify Modal */}
      {showVerifyModal && (
        <VerifyPaymentModal
          request={request}
          isResubmission={isResubmission}
          onClose={() => setShowVerifyModal(false)}
          onSuccess={onActionComplete}
        />
      )}

      {/* Reject Modal */}
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