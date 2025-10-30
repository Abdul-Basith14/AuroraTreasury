import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { payReimbursement } from '../../utils/treasurerAPI';
import { 
  X as XIcon,
  IndianRupee as CurrencyRupeeIcon,
  Upload as UploadIcon,
  AlertTriangle as ExclamationIcon,
  CheckCircle as CheckCircleIcon
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pay Reimbursement</h2>
            <p className="text-sm text-gray-600 mt-1">Upload payment proof after sending money</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100"
          >
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Member & Request Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">Member</p>
                <p className="font-semibold text-gray-900">{request.userId.name}</p>
                <p className="text-xs text-gray-600">{request.userId.usn}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Amount to Pay</p>
                <div className="flex items-center text-2xl font-bold text-gray-900">
                  <CurrencyRupeeIcon className="w-6 h-6" />
                  {request.amount}
                </div>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-gray-600 mb-1">Description</p>
                <p className="text-sm text-gray-900">{request.description}</p>
              </div>
              {request.userId.mobileNumber && (
                <div className="col-span-2">
                  <p className="text-xs text-gray-600 mb-1">Mobile Number</p>
                  <p className="text-sm text-gray-900">📱 {request.userId.mobileNumber}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <ExclamationIcon className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-800 mb-2">Payment Instructions:</p>
                <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                  <li>Send ₹{request.amount} to the member via UPI/Bank Transfer</li>
                  <li>Take a CLEAR screenshot of the payment confirmation</li>
                  <li>Upload the screenshot below</li>
                  <li>Member will verify and confirm receipt</li>
                </ol>
              </div>
            </div>
          </div>
          
          {/* Upload Payment Proof */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Proof <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="payment-proof-upload"
              />
              <label htmlFor="payment-proof-upload" className="cursor-pointer">
                <UploadIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload payment screenshot</p>
                <p className="text-xs text-gray-500">JPG, PNG, HEIC (Max 5MB)</p>
              </label>
            </div>
            
            {photoPreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{paymentProof.name}</p>
                    <p className="text-xs text-gray-500">{(paymentProof.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentProof(null);
                    setPhotoPreview(null);
                  }}
                  className="text-red-500 hover:text-red-700"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            )}
            
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </div>
          
          {/* Optional Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message to Member (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows="3"
              maxLength="200"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="e.g., Payment sent to your UPI. Please check and confirm."
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{message.length}/200</p>
          </div>
          
          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <div className="flex">
              <ExclamationIcon className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <p>Make sure you have actually sent the payment before uploading proof. ₹{request.amount} will be deducted from your wallet once member confirms receipt.</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
            disabled={paying}
          >
            Cancel
          </button>
          <button
            onClick={handlePay}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={paying || !paymentProof}
          >
            {paying ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
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
  );
};

export default PayReimbursementModal;