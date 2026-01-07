import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PayFailedPaymentModal Component
 * Modal for members to resubmit payment proof for failed payments
 */
const PayFailedPaymentModal = ({ isOpen, onClose, payment, refreshPayments }) => {
  const [paymentPhoto, setPaymentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [note, setNote] = useState('');
  const [clubSettings, setClubSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (isOpen) fetchClubSettings();
  }, [isOpen]);

  const fetchClubSettings = async () => {
    setLoadingSettings(true);
    try {
      const response = await groupFundAPI.getSettings();
      if (response.success) setClubSettings(response.data);
    } catch (error) {
      console.error('Error fetching club settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, HEIC, WEBP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPaymentPhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!paymentPhoto) {
      toast.error('Please upload payment proof');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('paymentProof', paymentPhoto);
      if (note) formData.append('note', note);

      await groupFundAPI.resubmitPayment(payment._id, formData);
      toast.success('Payment proof submitted! Awaiting treasurer verification.');
      handleClose();
      refreshPayments();
    } catch (error) {
      console.error('Error resubmitting payment:', error);
      toast.error(error.message || 'Failed to submit payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setPaymentPhoto(null);
    setPhotoPreview(null);
    setNote('');
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-black/90 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-[#A6C36F]/20 shadow-[0_0_25px_rgba(166,195,111,0.1)] backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-[#A6C36F]/20 bg-black/40 rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-[#F5F3E7]">Pay Failed Payment</h2>
            <p className="text-sm text-[#E8E3C5]/80 mt-1">{payment.month}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-[#E8E3C5] hover:text-[#A6C36F] p-2 rounded-full hover:bg-[#A6C36F]/10 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-[#F5F3E7]">
          
          {/* Alert */}
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">This payment was marked as FAILED</p>
                <p className="text-xs text-[#E8E3C5]/80 mt-1">Pay now to update your payment status</p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-black/40 rounded-xl p-4 border border-[#A6C36F]/20">
            <h3 className="text-sm font-semibold text-[#E8E3C5] mb-3">Payment Details:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#E8E3C5]/70">Month:</span>
                <span className="font-semibold text-[#F5F3E7]">{payment.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8E3C5]/70">Amount:</span>
                <span className="font-bold text-xl text-[#A6C36F]">₹ {payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8E3C5]/70">Original Deadline:</span>
                <span className="text-[#E8E3C5]">
                  {new Date(payment.deadline).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {loadingSettings ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6C36F]"></div>
            </div>
          ) : clubSettings && (
            <div className="text-center">
              <h3 className="text-sm font-semibold text-[#E8E3C5] mb-3">
                Scan QR Code to Pay:
              </h3>
              <div className="inline-block p-4 bg-white rounded-xl border border-[#A6C36F]/20">
                <img
                  src={clubSettings.treasurerQRCode}
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain mx-auto rounded-lg"
                />
              </div>
              <div className="mt-3">
                <p className="text-sm text-[#E8E3C5]/80">
                  <span className="font-medium text-[#F5F3E7]">Amount to Pay:</span> ₹ {payment.amount}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-[#A6C36F]/10 border-l-4 border-[#A6C36F] p-4 rounded-lg">
            <p className="text-sm font-medium text-[#A6C36F] mb-2">Important Instructions:</p>
            <ul className="text-xs text-[#E8E3C5]/80 space-y-1">
              <li>• Complete the payment via UPI</li>
              <li>• Take a clear screenshot showing payment amount and transaction ID</li>
              <li>• Upload the screenshot below</li>
              <li>• Treasurer will verify and update your status</li>
            </ul>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Upload Payment Proof <span className="text-[#A6C36F]">*</span>
            </label>
            <div className="border-2 border-dashed border-[#A6C36F]/30 rounded-xl p-6 text-center hover:border-[#A6C36F]/60 transition cursor-pointer bg-black/20">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="payment-proof-upload"
              />
              <label htmlFor="payment-proof-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-[#A6C36F]/60 mx-auto mb-2" />
                <p className="text-sm text-[#E8E3C5]/80 mb-1">Click to upload or drag & drop</p>
                <p className="text-xs text-[#E8E3C5]/40">JPG, PNG, HEIC, WEBP (Max 5MB)</p>
              </label>
            </div>

            {photoPreview && (
              <div className="mt-4 p-4 bg-black/40 rounded-xl flex items-center justify-between border border-[#A6C36F]/20">
                <div className="flex items-center">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg mr-3 border border-[#A6C36F]/20"
                  />
                  <div>
                    <p className="text-sm font-medium text-[#E8E3C5]">{paymentPhoto.name}</p>
                    <p className="text-xs text-[#E8E3C5]/60">
                      {(paymentPhoto.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentPhoto(null);
                    setPhotoPreview(null);
                  }}
                  className="text-[#A6C36F]/70 hover:text-[#A6C36F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Add Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              maxLength="200"
              className="w-full px-4 py-2 bg-black/40 border border-[#A6C36F]/20 rounded-xl focus:ring-2 focus:ring-[#A6C36F]/40 focus:border-transparent resize-none text-[#F5F3E7] placeholder-[#E8E3C5]/30"
              placeholder="Add any additional information (e.g., reason for delay, etc.)"
            />
            <p className="text-xs text-[#E8E3C5]/60 mt-1 text-right">{note.length}/200</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-[#A6C36F]/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-[#A6C36F]/20 text-[#E8E3C5]/80 rounded-xl hover:bg-[#A6C36F]/10 font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#A6C36F] text-black rounded-xl hover:bg-[#8FAE5D] disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold shadow-lg hover:shadow-[#A6C36F]/20"
              disabled={submitting || !paymentPhoto}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5 mr-2" />
                  Submit Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayFailedPaymentModal;
