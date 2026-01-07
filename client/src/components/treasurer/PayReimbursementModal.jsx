import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { payReimbursement } from '../../utils/treasurerAPI';
import { 
  X as XIcon,
  IndianRupee as CurrencyRupeeIcon,
  Upload as UploadIcon,
  AlertTriangle as ExclamationIcon,
  CheckCircle as CheckCircleIcon,
  Phone as PhoneIcon
} from 'lucide-react';

const PayReimbursementModal = ({ isOpen, onClose, request, onSuccess, currentBalance }) => {
  const [message, setMessage] = useState('');
  const [paymentProof, setPaymentProof] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  
  if (!isOpen || !request) return null;
  
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, HEIC)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }
    
    setPaymentProof(file);
    setError('');
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handlePay = async () => {
    if (!paymentProof) {
      setError('Payment proof screenshot is required');
      return;
    }
    
    setPaying(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentProof);
      if (message) formData.append('message', message);
      
      await payReimbursement(request._id, formData);
      
      toast.success('Reimbursement payment confirmed and proof uploaded!');
      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Pay reimbursement error:', error);
      toast.error(error.response?.data?.message || 'Failed to process payment');
    } finally {
      setPaying(false);
    }
  };
  
  const handleClose = () => {
    setMessage('');
    setPaymentProof(null);
    setPhotoPreview(null);
    setError('');
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0B0B09] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-[#A6C36F]/20 shadow-[0_0_50px_rgba(166,195,111,0.1)]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#A6C36F]/20 bg-black/40">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F3E7]">
              Pay Reimbursement
            </h2>
            <p className="text-sm text-[#E8E3C5]/70 mt-1">
              Upload payment proof after sending money
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#E8E3C5]/50 hover:text-[#F5F3E7] p-2 rounded-full hover:bg-[#A6C36F]/10 transition"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Member & Request Info */}
          <div className="bg-[#A6C36F]/5 rounded-xl p-5 border border-[#A6C36F]/10">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs text-[#E8E3C5]/60 mb-1 uppercase tracking-wider">Member</p>
                <p className="font-bold text-[#F5F3E7] text-lg">{request.userId.name}</p>
                <p className="text-sm text-[#E8E3C5]/70">{request.userId.usn}</p>
              </div>
              <div>
                <p className="text-xs text-[#E8E3C5]/60 mb-1 uppercase tracking-wider">Amount to Pay</p>
                <div className="flex items-center text-2xl font-bold text-[#A6C36F]">
                  <CurrencyRupeeIcon className="w-6 h-6 mr-1" />
                  {request.amount}
                </div>
              </div>
              <div className="col-span-2 pt-2 border-t border-[#A6C36F]/10">
                <p className="text-xs text-[#E8E3C5]/60 mb-1 uppercase tracking-wider">Description</p>
                <p className="text-sm text-[#F5F3E7]">{request.description}</p>
              </div>
              {request.userId.mobileNumber && (
                <div className="col-span-2 pt-2 border-t border-[#A6C36F]/10">
                  <p className="text-xs text-[#E8E3C5]/60 mb-1 uppercase tracking-wider">Mobile Number</p>
                  <p className="text-sm text-[#F5F3E7] flex items-center">
                    <PhoneIcon className="w-4 h-4 mr-2 text-[#A6C36F]" /> {request.userId.mobileNumber}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start">
            <ExclamationIcon className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200/90">
              <p className="font-semibold mb-1 text-blue-200">Important:</p>
              <p>Please make the payment to the member using your preferred UPI app or bank transfer. Once done, take a screenshot of the payment success screen and upload it below.</p>
            </div>
          </div>
          
          {/* Upload Proof */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Upload Payment Proof <span className="text-red-400">*</span>
            </label>
            
            {!photoPreview ? (
              <div className="border-2 border-dashed border-[#A6C36F]/30 rounded-xl p-8 text-center hover:bg-[#A6C36F]/5 hover:border-[#A6C36F]/50 transition cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-16 h-16 bg-[#A6C36F]/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
                  <UploadIcon className="w-8 h-8 text-[#A6C36F]" />
                </div>
                <p className="text-[#F5F3E7] font-medium">Click to upload screenshot</p>
                <p className="text-xs text-[#E8E3C5]/50 mt-1">JPG, PNG, HEIC up to 5MB</p>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-[#A6C36F]/30 group">
                <img 
                  src={photoPreview} 
                  alt="Preview" 
                  className="w-full h-64 object-contain bg-black/60" 
                />
                <button
                  onClick={() => {
                    setPaymentProof(null);
                    setPhotoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                >
                  <XIcon className="w-4 h-4" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-2 text-center text-xs text-[#A6C36F]">
                  Click X to remove and upload different image
                </div>
              </div>
            )}
            {error && <p className="text-red-400 text-sm mt-2 flex items-center"><ExclamationIcon className="w-3 h-3 mr-1" /> {error}</p>}
          </div>
          
          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Message to Member (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., Sent via GPay to your number..."
              className="w-full px-4 py-3 bg-black/40 border border-[#A6C36F]/20 rounded-xl text-[#F5F3E7] placeholder-[#E8E3C5]/30 focus:ring-2 focus:ring-[#A6C36F]/50 focus:border-transparent outline-none transition resize-none h-24"
            />
          </div>
          
          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-[#A6C36F]/20">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-[#E8E3C5] bg-black/40 border border-[#A6C36F]/20 hover:bg-[#A6C36F]/10 transition"
              disabled={paying}
            >
              Cancel
            </button>
            <button
              onClick={handlePay}
              disabled={paying}
              className="flex-1 px-4 py-3 rounded-xl font-bold text-black bg-[#A6C36F] hover:bg-[#95B064] transition shadow-[0_0_20px_rgba(166,195,111,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {paying ? (
                <>
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Confirm Payment
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayReimbursementModal;