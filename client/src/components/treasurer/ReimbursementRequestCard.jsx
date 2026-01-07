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
  Sparkles,
  Clock
} from 'lucide-react';

const ReimbursementRequestCard = ({ request, onPay, onReject, isResubmission = false }) => {
  const [showImageUrl, setShowImageUrl] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleShowImage = (url) => setShowImageUrl(url);
  const handleCloseImage = () => setShowImageUrl(null);

  const headerTitle = request?.userId?.name || request?.member?.name || 'Unknown';
  const usn = request?.userId?.usn || request?.member?.usn || '';
  const date = new Date(request.requestDate || request.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });

  // Status styling
  const getStatusStyle = () => {
    if (isResubmission) return {
      badge: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 text-yellow-400 border-yellow-500/30',
      glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]'
    };
    
    switch(request.status) {
      case 'Pending':
        return {
          badge: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/30',
          glow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]'
        };
      case 'Paid':
        return {
          badge: 'bg-gradient-to-r from-[#A6C36F]/20 to-[#8FAE5D]/20 text-[#A6C36F] border-[#A6C36F]/30',
          glow: 'shadow-[0_0_15px_rgba(166,195,111,0.15)]'
        };
      case 'Received':
        return {
          badge: 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 text-emerald-400 border-emerald-500/30',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]'
        };
      default:
        return {
          badge: 'bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]'
        };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <>
    <div 
      className={`relative bg-black rounded-2xl p-5 border border-[#3A3E36] transition-all duration-500 flex flex-col h-full group overflow-hidden ${
        isHovered ? 'border-[#A6C36F] shadow-[0_8px_30px_rgba(166,195,111,0.15)]' : 'shadow-[0_4px_20px_rgba(0,0,0,0.5)]'
      } ${statusStyle.glow}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient - Subtle olive glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#A6C36F]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="relative z-10">
        {/* Header with enhanced styling */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            {request?.userId?.profilePhoto || request?.member?.profilePhoto ? (
              <div className="relative">
                <img
                  src={request.userId?.profilePhoto || request.member?.profilePhoto}
                  alt={headerTitle}
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#A6C36F]/40 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#A6C36F] to-[#8FAE5D] rounded-full border-2 border-[#1F221C]" />
              </div>
            ) : (
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-[#A6C36F]/20 to-[#8FAE5D]/10 flex items-center justify-center border-2 border-[#A6C36F]/30 shadow-inner">
                <UserIcon className="w-6 h-6 text-[#A6C36F]" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-t from-[#A6C36F]/10 to-transparent" />
              </div>
            )}
            <div>
              <h3 className="font-bold text-[#F5F3E7] text-base leading-tight flex items-center gap-2">
                {headerTitle}
                {request.status === 'Received' && <Sparkles className="w-3 h-3 text-emerald-400" />}
              </h3>
              <p className="text-xs text-[#E8E3C5]/50 font-mono">{usn}</p>
            </div>
          </div>
          
          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-sm ${statusStyle.badge}`}>
            {isResubmission ? 'Resubmitted' : request.status}
          </span>
        </div>

        {/* Enhanced Amount Display */}
        <div className="mb-4 p-4 rounded-xl bg-[#0B0B09] border border-[#A6C36F]/30 shadow-inner relative overflow-hidden group-hover:border-[#A6C36F]/50 transition-colors duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#A6C36F]/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex justify-between items-center">
            <div className="flex-1">
              <p className="text-[10px] text-[#A6C36F] uppercase tracking-widest mb-1 font-bold">Reimbursement Amount</p>
              <div className="flex items-baseline gap-1">
                <CurrencyRupeeIcon className="w-5 h-5 text-[#F5F3E7] mb-0.5" />
                <span className="text-3xl font-black text-[#F5F3E7] drop-shadow-sm">
                  {request.amount}
                </span>
              </div>
            </div>
            <div className="text-right bg-black px-3 py-2 rounded-lg border border-[#3A3E36]">
              <div className="flex items-center gap-1 text-[10px] text-[#E8E3C5]/40 mb-0.5">
                <Clock className="w-3 h-3" />
                <span className="uppercase tracking-wider">Requested</span>
              </div>
              <p className="text-xs text-[#F5F3E7] font-semibold">{date}</p>
            </div>
          </div>
        </div>

        {/* Description with better styling */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <DocumentTextIcon className="w-3.5 h-3.5 text-[#A6C36F]" />
            <span className="text-[10px] text-[#E8E3C5]/60 uppercase tracking-widest font-bold">Description</span>
          </div>
          <p className="text-xs text-[#F5F3E7] leading-relaxed bg-[#0B0B09] p-3 rounded-lg border border-[#3A3E36] line-clamp-2">
            {request.description}
          </p>
        </div>

        {/* Enhanced Proof Buttons */}
        <div className="flex gap-2 mb-4">
          {(request.billProofPhoto || (request.billProofs && request.billProofs.length > 0)) && (
            <button 
              onClick={() => handleShowImage((request.billProofs && request.billProofs[0]) || request.billProofPhoto)}
              className="flex-1 group/btn relative overflow-hidden flex items-center justify-center py-2.5 px-3 bg-[#0B0B09] border border-[#3A3E36] rounded-lg hover:border-[#A6C36F] transition-all duration-300 text-xs text-[#E8E3C5] hover:text-[#A6C36F] shadow-md hover:shadow-[0_0_15px_rgba(166,195,111,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#A6C36F]/0 via-[#A6C36F]/10 to-[#A6C36F]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <PhotographIcon className="w-4 h-4 mr-2 relative z-10" />
              <span className="font-semibold relative z-10">View Bill</span>
            </button>
          )}
          
          {request.treasurerResponse?.paymentProofPhoto && (
            <button 
              onClick={() => handleShowImage(request.treasurerResponse.paymentProofPhoto)}
              className="flex-1 group/btn relative overflow-hidden flex items-center justify-center py-2.5 px-3 bg-[#0B0B09] border border-[#3A3E36] rounded-lg hover:border-[#A6C36F] transition-all duration-300 text-xs text-[#E8E3C5] hover:text-[#A6C36F] shadow-md hover:shadow-[0_0_15px_rgba(166,195,111,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#A6C36F]/0 via-[#A6C36F]/10 to-[#A6C36F]/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" />
              <CheckCircleIcon className="w-4 h-4 mr-2 relative z-10" />
              <span className="font-semibold relative z-10">Payment Proof</span>
            </button>
          )}
        </div>

        {/* Enhanced Action Buttons */}
        {(request.status === 'Pending' || isResubmission) && (
          <div className="flex gap-3 pt-3 mt-auto border-t border-[#3A3E36]">
            <button 
              onClick={() => onPay(request)} 
              className="flex-1 group/pay relative overflow-hidden py-3 rounded-xl font-bold text-sm text-[#0B0B09] bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] hover:from-[#8FAE5D] hover:to-[#A6C36F] transition-all duration-300 shadow-lg shadow-[#A6C36F]/20 hover:shadow-[#A6C36F]/40 hover:scale-[1.02] flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/pay:translate-x-[100%] transition-transform duration-700" />
              <CheckCircleIcon className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Pay & Upload</span>
            </button>
            <button 
              onClick={() => onReject(request)} 
              className="flex-1 group/reject relative overflow-hidden py-3 rounded-xl font-bold text-sm text-red-300 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-500/40 hover:bg-red-500/30 hover:border-red-500/60 transition-all duration-300 shadow-lg shadow-red-900/10 hover:shadow-red-900/20 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover/reject:translate-x-[100%] transition-transform duration-700" />
              <XCircleIcon className="w-4 h-4 mr-2 relative z-10" />
              <span className="relative z-10">Reject</span>
            </button>
          </div>
        )}
      </div>
    </div>

    {/* Enhanced Image Modal */}
    {showImageUrl && (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300" 
        onClick={handleCloseImage}
      >
        <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
          <div className="absolute -top-16 right-0 flex items-center gap-3">
            <span className="text-sm text-[#E8E3C5]/60 font-medium">Press ESC to close</span>
            <button 
              onClick={handleCloseImage} 
              className="p-3 bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] text-[#0B0B09] rounded-full hover:scale-110 transition-transform duration-200 shadow-lg shadow-[#A6C36F]/30"
            >
              <XIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="relative rounded-2xl overflow-hidden border-4 border-[#A6C36F]/30 shadow-2xl shadow-[#A6C36F]/20">
            <img 
              src={showImageUrl} 
              alt="Proof" 
              className="max-w-full max-h-[85vh] object-contain" 
            />
          </div>
        </div>
      </div>
    )}
    </>
  );
};

export default ReimbursementRequestCard;