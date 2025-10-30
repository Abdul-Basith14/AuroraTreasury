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
  X as XIcon
} from 'lucide-react';

const ReimbursementRequestCard = ({ request, onPay, onReject }) => {
  const [showBillImage, setShowBillImage] = useState(false);
  const [showPaymentImage, setShowPaymentImage] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  
  const getStatusConfig = (status) => {
    const configs = {
      'Pending': { 
        bg: 'bg-yellow-50', 
        border: 'border-yellow-300', 
        text: 'text-yellow-800', 
        icon: ClockIcon,
        badgeBg: 'bg-yellow-100'
      },
      'Paid': { 
        bg: 'bg-blue-50', 
        border: 'border-blue-300', 
        text: 'text-blue-800', 
        icon: CheckCircleIcon,
        badgeBg: 'bg-blue-100'
      },
      'Received': { 
        bg: 'bg-green-50', 
        border: 'border-green-300', 
        text: 'text-green-800', 
        icon: CheckCircleIcon,
        badgeBg: 'bg-green-100'
      },
      'Rejected': { 
        bg: 'bg-red-50', 
        border: 'border-red-300', 
        text: 'text-red-800', 
        icon: XCircleIcon,
        badgeBg: 'bg-red-100'
      }
    };
    return configs[status] || configs['Pending'];
  };
  
  const statusConfig = getStatusConfig(request.status);
  const StatusIcon = statusConfig.icon;
  
  return (
    <>
      <div className={`border-2 ${statusConfig.border} ${statusConfig.bg} rounded-xl p-6 hover:shadow-lg transition bg-white`}>
        {/* Header - Member Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {request.userId.profilePhoto ? (
              <img
                src={request.userId.profilePhoto}
                alt={request.userId.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-purple-200"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center">
                <UserIcon className="w-7 h-7 text-purple-600" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-gray-900 text-lg">{request.userId.name}</h3>
              <p className="text-sm text-gray-600">{request.userId.usn}</p>
              <p className="text-xs text-gray-500">{request.userId.year} • {request.userId.branch}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center ${statusConfig.badgeBg} ${statusConfig.text} border-2 ${statusConfig.border}`}>
            <StatusIcon className="w-4 h-4 mr-1" />
            {request.status}
          </span>
        </div>
        
        {/* Amount - Highlighted */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg p-4 mb-4">
          <p className="text-xs opacity-90 mb-1">Reimbursement Amount</p>
          <div className="flex items-center text-3xl font-bold">
            <CurrencyRupeeIcon className="w-8 h-8 mr-1" />
            {request.amount}
          </div>
        </div>
        
        {/* Details */}
        <div className="space-y-3 mb-4">
          {/* Description */}
          <div className="flex items-start bg-gray-50 rounded-lg p-3">
            <DocumentTextIcon className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 mb-1">Purchase Description:</p>
              <p className="text-sm text-gray-900">{request.description}</p>
            </div>
          </div>
          
          {/* Request Date */}
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="w-4 h-4 mr-2" />
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
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="w-4 h-4 mr-2" />
              <span>📱 {request.userId.mobileNumber}</span>
            </div>
          )}
          
          {/* Bill Proof */}
          {request.billProofPhoto && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <PhotographIcon className="w-4 h-4 mr-1" />
                Bill Proof
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowFullImage(true)}
                  className="aspect-[3/2] w-full rounded-lg overflow-hidden hover:opacity-90 transition relative"
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
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs font-medium text-blue-700 mb-2 flex items-center">
                <PhotographIcon className="w-4 h-4 mr-1" />
                Payment Proof • {new Date(request.treasurerResponse.respondedDate).toLocaleDateString()}
              </p>
              <div className="relative">
                <button
                  onClick={() => setShowPaymentImage(true)}
                  className="aspect-[3/2] w-full rounded-lg overflow-hidden hover:opacity-90 transition relative"
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
                <p className="text-sm text-blue-700 mt-2">
                  💬 {request.treasurerResponse.message}
                </p>
              )}
            </div>
          )}
          
          {/* Rejection Reason (if rejected) */}
          {request.status === 'Rejected' && (
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs font-medium text-red-600 mb-1">Rejection Reason:</p>
              <p className="text-sm text-red-700">{request.rejectionReason}</p>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        {request.status === 'Pending' && (
          <div className="flex space-x-3">
            <button
              onClick={() => onPay(request)}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition flex items-center justify-center"
            >
              <CheckCircleIcon className="w-5 h-5 mr-2" />
              Pay & Upload Proof
            </button>
            <button
              onClick={() => onReject(request)}
              className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition flex items-center justify-center"
            >
              <XCircleIcon className="w-5 h-5 mr-2" />
              Reject
            </button>
          </div>
        )}
      </div>
      
      {/* Full Image Modal */}
      {showFullImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFullImage(false)}
        >
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowFullImage(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <img
              src={request.billProofPhoto}
              alt="Bill Proof"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
      
      {/* Payment Proof Full Image Modal */}
      {showPaymentImage && request.treasurerResponse?.paymentProofPhoto && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowPaymentImage(false)}
        >
          <div className="relative max-w-6xl w-full">
            <button
              onClick={() => setShowPaymentImage(false)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-70"
            >
              <XIcon className="w-6 h-6" />
            </button>
            <img
              src={request.treasurerResponse.paymentProofPhoto}
              alt="Payment Proof"
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ReimbursementRequestCard;