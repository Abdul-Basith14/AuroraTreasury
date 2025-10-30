import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle, QrCode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PayGroupFundModal Component
 * Modal for submitting group fund payment with image upload
 * 
 * @param {boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Callback to close modal
 * @param {Function} onSuccess - Callback after successful payment submission
 */
const PayGroupFundModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [settings, setSettings] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState('');

  // Generate months from November 2025 onwards for current academic year
  const generateMonths = () => {
    const months = [];
    const startYear = 2025;
    const startMonth = 11; // November (0-indexed)
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    // Generate 12 months starting from November 2025
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i - 1) % 12;
      const year = startYear + Math.floor((startMonth + i - 1) / 12);
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];

      months.push({
        value: `${monthNames[monthIndex]} ${year}`,
        label: `${monthNames[monthIndex]} ${year}`,
        monthNumber: monthIndex + 1,
        year: year,
      });
    }

    return months;
  };

  const monthOptions = generateMonths();

  // Fetch club settings when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      // Reset form
      setSelectedMonth('');
      setSelectedImage(null);
      setImagePreview(null);
      setNotes('');
    }
  }, [isOpen]);

  /**
   * Fetch club settings (QR code, payment amount, instructions)
   */
  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const response = await groupFundAPI.getSettings();
      if (response.success) {
        setSettings(response.data);
      }
    } catch (error) {
      toast.error('Failed to load payment settings');
      console.error('Error fetching settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  /**
   * Handle image file selection
   */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error('Only JPG, PNG, and WEBP images are allowed');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Remove selected image
   */
  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!selectedMonth) {
      toast.error('Please select a month');
      return;
    }

    if (!selectedImage) {
      toast.error('Please upload payment proof image');
      return;
    }

    try {
      setLoading(true);

      // Find selected month details
      const monthDetails = monthOptions.find(m => m.value === selectedMonth);

      // Create FormData for multipart/form-data
      const formData = new FormData();
      formData.append('month', monthDetails.value);
      formData.append('year', monthDetails.year);
      formData.append('monthNumber', monthDetails.monthNumber);
      formData.append('academicYear', settings?.academicYear || '2025-2026');
      formData.append('paymentProof', selectedImage);
      if (notes) {
        formData.append('notes', notes);
      }

      // Submit payment
      const response = await groupFundAPI.submitPayment(formData);

      if (response.success) {
        toast.success('Payment proof submitted successfully! 🎉');
        onSuccess(); // Refresh payment list
        onClose(); // Close modal
      } else {
        toast.error(response.message || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error(error.message || 'Failed to submit payment proof');
    } finally {
      setLoading(false);
    }
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-2xl">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Pay Group Fund</h2>
              <p className="text-sm text-gray-600">Submit your monthly payment proof</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loadingSettings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Payment Instructions */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-blue-900 flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>Payment Instructions</span>
                  </h3>
                  <p className="text-sm text-blue-800">
                    {settings?.paymentInstructions || 'Please pay the monthly group fund by the deadline.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    <div className="text-sm">
                      <span className="text-blue-700">1st Year:</span>
                      <span className="font-semibold text-blue-900"> ₹ {settings?.fundAmountByYear?.firstYear || 50}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-700">2nd Year:</span>
                      <span className="font-semibold text-blue-900"> ₹ {settings?.fundAmountByYear?.secondYear || 100}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-700">3rd Year:</span>
                      <span className="font-semibold text-blue-900"> ₹ {settings?.fundAmountByYear?.thirdYear || 150}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-blue-700">4th Year:</span>
                      <span className="font-semibold text-blue-900"> ₹ {settings?.fundAmountByYear?.fourthYear || 200}</span>
                    </div>
                  </div>
                </div>

                {/* Your Amount */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">Your Payment Amount:</p>
                  <p className="text-3xl font-bold text-green-900">₹ {settings?.userAmount || 0}</p>
                </div>

                {/* QR Code */}
                {settings?.treasurerQRCode && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                      <QrCode className="w-5 h-5" />
                      <span>Scan to Pay</span>
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={settings.treasurerQRCode}
                        alt="Payment QR Code"
                        className="w-48 h-48 object-contain border-2 border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
                  <h3 className="font-semibold text-yellow-900">📸 Important Note</h3>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>Take a clear screenshot of the payment confirmation</li>
                    <li>Upload the payment proof below</li>
                    <li>Ensure the transaction ID is visible</li>
                  </ul>
                </div>

                {/* Month Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Choose a month...</option>
                    {monthOptions.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Payment Proof *
                  </label>
                  
                  {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-600">
                        <Upload className="w-10 h-10" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        <p className="text-xs text-gray-500">JPG, PNG, or WEBP (Max 5MB)</p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleImageChange}
                      />
                    </label>
                  ) : (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Payment proof preview"
                        className="w-full h-64 object-contain border-2 border-gray-300 rounded-lg bg-gray-50"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500 mt-1">{notes.length}/500 characters</p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedMonth || !selectedImage}
                    className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4" />
                        <span>Submit Payment</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayGroupFundModal;
