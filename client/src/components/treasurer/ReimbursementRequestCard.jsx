import React, { useState } from 'react';
import {
  User as UserIcon,
  IndianRupee as CurrencyRupeeIcon,
  Calendar as CalendarIcon,
  FileText as DocumentTextIcon,
  Image as PhotographIcon,
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  X as XIcon,
} from 'lucide-react';

// helper: hex to rgba
const hexToRgba = (hex, alpha = 1) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const ACCENT_OLIVE = '#A6C36F';
const BG_SECONDARY = '#1F221C';

const ReimbursementRequestCard = ({ request, onPay, onReject, isResubmission = false }) => {
  const [showImageUrl, setShowImageUrl] = useState(null);

  const handleShowImage = (url) => setShowImageUrl(url);
  const handleCloseImage = () => setShowImageUrl(null);

  const headerTitle = request?.userId?.name || request?.member?.name || 'Unknown';
  const usn = request?.userId?.usn || request?.member?.usn || '';

  return (
    <div className="rounded-2xl p-5 border" style={{ backgroundColor: BG_SECONDARY, borderColor: '#2E322A' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          {request?.userId?.profilePhoto || request?.member?.profilePhoto ? (
            <img
              src={request.userId?.profilePhoto || request.member?.profilePhoto}
              alt={headerTitle}
              className="w-12 h-12 rounded-full object-cover border-2"
              style={{ borderColor: hexToRgba(ACCENT_OLIVE, 0.35) }}
            />
          ) : (
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: hexToRgba(ACCENT_OLIVE, 0.08) }}>
              <UserIcon className="w-6 h-6" style={{ color: ACCENT_OLIVE }} />
            </div>
          )}
          <div>
            <h3 className="font-semibold text-white">{headerTitle}</h3>
            <p className="text-sm text-gray-300">{usn} {request?.userId?.year || ''}</p>
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-800 text-gray-200">{isResubmission ? 'Resubmitted' : request.status}</span>
        </div>
      </div>

      <div className="mb-3 p-3 rounded-lg" style={{ backgroundColor: hexToRgba(ACCENT_OLIVE, 0.12) }}>
        <div className="text-xs text-gray-200">Reimbursement Amount</div>
        <div className="flex items-center text-2xl font-bold text-[#A6C36F]">
          <CurrencyRupeeIcon className="w-6 h-6 mr-1" />
          {request.amount}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-start bg-gray-800 rounded-md p-3">
          <DocumentTextIcon className="w-5 h-5 text-gray-300 mr-2" />
          <div>
            <div className="text-xs text-gray-300">Description</div>
            <div className="text-sm text-white">{request.description}</div>
          </div>
        </div>

        <div className="flex items-center text-sm text-gray-300">
          <CalendarIcon className="w-4 h-4 mr-2 text-[#A6C36F]" />
          <div>Requested: {new Date(request.requestDate || request.createdAt).toLocaleString()}</div>
        </div>

        { (request.billProofPhoto || request.billProofs) && (
          <div className="bg-gray-800 rounded-md p-3">
            <div className="text-xs text-gray-300 mb-2 flex items-center">
              <PhotographIcon className="w-4 h-4 mr-1 text-[#A6C36F]" /> Bill Proof
            </div>
            <button onClick={() => handleShowImage((request.billProofs && request.billProofs[0]) || request.billProofPhoto)} className="w-full rounded-md overflow-hidden">
              <img src={(request.billProofs && request.billProofs[0]) || request.billProofPhoto} alt="Bill" className="w-full h-40 object-cover rounded-md" />
            </button>
          </div>
        )}

        { request.treasurerResponse?.paymentProofPhoto && (
          <div className="bg-blue-900/20 rounded-md p-3">
            <div className="text-xs text-blue-200 mb-1">Payment Proof</div>
            <button onClick={() => handleShowImage(request.treasurerResponse.paymentProofPhoto)} className="w-full rounded-md overflow-hidden">
              <img src={request.treasurerResponse.paymentProofPhoto} alt="Payment" className="w-full h-40 object-cover rounded-md" />
            </button>
            {request.treasurerResponse.message && <div className="text-sm text-blue-200 mt-2">{request.treasurerResponse.message}</div>}
          </div>
        )}
      </div>

      {(request.status === 'Pending' || isResubmission) && (
        <div className="flex space-x-3 mt-3">
          <button onClick={() => onPay(request)} className="flex-1 px-3 py-2 rounded-md font-semibold" style={{ backgroundColor: ACCENT_OLIVE, color: '#07120A' }}>
            <div className="flex items-center justify-center"><CheckCircleIcon className="w-4 h-4 mr-2" /> Pay & Upload Proof</div>
          </button>
          <button onClick={() => onReject(request)} className="flex-1 px-3 py-2 rounded-md font-semibold bg-gray-700 text-gray-200">
            <div className="flex items-center justify-center"><XCircleIcon className="w-4 h-4 mr-2" /> Reject</div>
          </button>
        </div>
      )}

      {showImageUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={handleCloseImage}>
          <div className="max-w-4xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <button onClick={handleCloseImage} className="absolute top-6 right-6 p-2 bg-black bg-opacity-50 rounded-full text-white"><XIcon className="w-6 h-6" /></button>
            <img src={showImageUrl} alt="full" className="w-full h-auto rounded-md object-contain max-h-[90vh]" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReimbursementRequestCard;