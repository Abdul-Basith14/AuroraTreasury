import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  UserCircle,
  Camera,
  Calendar,
  IndianRupee
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

  return (
    <>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden">
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
                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <UserCircle className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Member Details */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {request.userId?.name || 'Unknown'}
                </h3>
                <p className="text-sm text-gray-600">{request.userId?.usn || 'N/A'}</p>
                <p className="text-sm text-gray-600">{request.userId?.email || 'N/A'}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {request.userId?.year || 'N/A'} Year
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {request.userId?.branch || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section - Payment Details */}
            <div className="flex-1 space-y-3">
              {/* Status Badge */}
              <div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'Pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : request.status === 'Paid'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {request.status || 'Unknown'}
                </span>
              </div>

              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Payment Month</p>
                  <p className="text-sm">{request.month || 'N/A'} {request.year || ''}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-gray-700">
                <IndianRupee className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Amount</p>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{request.amount || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-gray-700">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium">Submitted On</p>
                  <p className="text-sm">{formatDate(submissionDate)}</p>
                </div>
              </div>

              {isResubmission && request.rejectionReason && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Previous Rejection Reason:
                  </p>
                  <p className="text-sm text-red-700">{request.rejectionReason}</p>
                </div>
              )}
            </div>

            {/* Right Section - Payment Proof */}
            <div className="flex-shrink-0">
              <div className="w-48">
                <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <Camera className="w-4 h-4 mr-1" />
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
                      className="w-full h-32 object-cover rounded-lg border-2 border-gray-200 group-hover:border-blue-500 transition"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                        Click to enlarge
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-sm text-gray-500">No proof uploaded</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center space-x-2 font-medium"
            >
              <XCircle className="w-5 h-5" />
              <span>Reject</span>
            </button>
            <button
              onClick={() => setShowVerifyModal(true)}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2 font-medium"
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
              className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100 transition"
            >
              <XCircle className="w-6 h-6 text-gray-700" />
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
