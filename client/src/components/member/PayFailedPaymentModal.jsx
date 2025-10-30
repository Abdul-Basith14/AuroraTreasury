import { useState, useEffect } from 'react';
import { X, Upload, AlertCircle, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PayFailedPaymentModal Component
 * Modal for members to resubmit payment proof for failed payments
 * 
 * @param {boolean} isOpen - Whether modal is visible
 * @param {Function} onClose - Handler to close modal
 * @param {Object} payment - Failed payment record to resubmit
 * @param {Function} refreshPayments - Callback to refresh parent payment list
 */
const PayFailedPaymentModal = ({ isOpen, onClose, payment, refreshPayments }) => {
  const [paymentPhoto, setPaymentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [note, setNote] = useState('');
  const [clubSettings, setClubSettings] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchClubSettings();
    }
  }, [isOpen]);

  /**
   * Fetch club settings (QR code, UPI ID, etc.)
   */
  const fetchClubSettings = async () => {
    setLoadingSettings(true);
    try {
      const response = await groupFundAPI.getSettings();
      
      if (response.success) {
        setClubSettings(response.data);
      }
    } catch (error) {
      console.error('Error fetching club settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoadingSettings(false);
    }
  };

  /**
   * Handle file selection
   */
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a valid image (JPG, PNG, HEIC, WEBP)');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setPaymentPhoto(file);

    // Generate preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Handle form submission
   */
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

  /**
   * Close modal and reset state
   */
  const handleClose = () => {
    setPaymentPhoto(null);
    setPhotoPreview(null);
    setNote('');
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-red-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pay Failed Payment</h2>
            <p className="text-sm text-gray-600 mt-1">{payment.month}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Alert */}
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  This payment was marked as FAILED
                </p>
                <p className="text-xs text-red-700 mt-1">
                  Pay now to update your payment status
                </p>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Payment Details:
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Month:</span>
                <span className="font-semibold text-gray-900">{payment.month}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-xl text-gray-900">₹ {payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Original Deadline:</span>
                <span className="text-gray-900">
                  {new Date(payment.deadline).toLocaleDateString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          {loadingSettings ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : clubSettings && (
            <div className="text-center">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Scan QR Code to Pay:
              </h3>
              <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                <img
                  src={clubSettings.treasurerQRCode}
                  alt="Payment QR Code"
                  className="w-64 h-64 object-contain mx-auto"
                />
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Amount to Pay:</span> ₹ {payment.amount}
                </p>
              </div>
            </div>
          )}

          <div className="border-t border-gray-200 pt-4"></div>

          {/* Instructions */}
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p className="text-sm font-medium text-blue-800 mb-2">Important Instructions:</p>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Complete the payment via UPI</li>
              <li>• Take a CLEAR screenshot showing payment amount and transaction ID</li>
              <li>• Upload the screenshot below</li>
              <li>• Treasurer will verify and update your status</li>
            </ul>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Payment Proof <span className="text-red-500">*</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-red-400 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                id="payment-proof-upload"
              />
              <label htmlFor="payment-proof-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1">Click to upload or drag & drop</p>
                <p className="text-xs text-gray-500">JPG, PNG, HEIC, WEBP (Max 5MB)</p>
              </label>
            </div>

            {photoPreview && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded mr-3"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">{paymentPhoto.name}</p>
                    <p className="text-xs text-gray-500">
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
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add Note (Optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows="3"
              maxLength="200"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              placeholder="Add any additional information (e.g., reason for delay, etc.)"
            />
            <p className="text-xs text-gray-500 mt-1 text-right">{note.length}/200</p>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium"
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
