import { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, AlertCircle, QrCode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';

/**
 * PayGroupFundModal Component
 * Modal for submitting group fund payment with image upload
 * * @param {boolean} isOpen - Whether modal is open
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
        // Backdrop uses Deep Black base color for background
        className="fixed inset-0 bg-[#0B0B09] bg-opacity-70 transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
            // Modal Card (a) Card Container 
            // bg-[#1F221C], rounded-2xl, shadow-at-glow, border border-[#3A3E36]/40
            className="relative bg-[#1F221C] rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] w-full max-w-2xl transform transition-all border border-[#3A3E36]/40"
        >
          {/* Header */}
          <div 
            // Header with Muted Olive-Gray border-b and Olive-Black bg 
            className="flex items-center justify-between px-6 py-4 border-b border-[#3A3E36] bg-[#1F221C] rounded-t-2xl"
          >
            <div>
              {/* text-gray-900 -> text-primary */}
              <h2 className="text-xl font-bold text-[#F5F3E7]">Pay Group Fund</h2> 
              {/* text-gray-600 -> text-secondary/80 */}
              <p className="text-sm text-[#E8E3C5]/80">Submit your monthly payment proof</p>
            </div>
            <button
              onClick={onClose}
              // Hover glow effect on close button
              className="p-2 hover:bg-[#3A3E36]/40 rounded-lg transition-colors" 
            >
              {/* text-gray-500 -> Muted Olive-Gray */}
              <X className="w-5 h-5 text-[#3A3E36]" /> 
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-[calc(100vh-200px)] overflow-y-auto">
            {loadingSettings ? (
              <div className="flex items-center justify-center py-12">
                {/* text-blue-600 -> Accent Olive */}
                <Loader2 className="w-8 h-8 text-[#A6C36F] animate-spin" /> 
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Payment Instructions (Blue -> Olive/Beige) */}
                <div 
                    // bg-blue-50 -> Olive-Black Panel bg (lighter contrast version of main panel, using Accent glow)
                    className="bg-[#1F221C]/80 border border-[#A6C36F]/40 rounded-lg p-4 space-y-2"
                >
                  {/* text-blue-900 -> Text Primary */}
                  <h3 className="font-semibold text-[#F5F3E7] flex items-center space-x-2"> 
                    {/* Icon text color */}
                    <AlertCircle className="w-5 h-5 text-[#A6C36F]" /> 
                    <span>Payment Instructions</span>
                  </h3>
                  {/* text-blue-800 -> Text Secondary */}
                  <p className="text-sm text-[#E8E3C5]"> 
                    {settings?.paymentInstructions || 'Please pay the monthly group fund by the deadline.'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {/* text-blue-700 -> Accent Olive, text-blue-900 -> Text Primary */}
                    <div className="text-sm">
                      <span className="text-[#A6C36F]">1st Year:</span>
                      <span className="font-semibold text-[#F5F3E7]"> ₹ {settings?.fundAmountByYear?.firstYear || 50}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#A6C36F]">2nd Year:</span>
                      <span className="font-semibold text-[#F5F3E7]"> ₹ {settings?.fundAmountByYear?.secondYear || 100}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#A6C36F]">3rd Year:</span>
                      <span className="font-semibold text-[#F5F3E7]"> ₹ {settings?.fundAmountByYear?.thirdYear || 150}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-[#A6C36F]">4th Year:</span>
                      <span className="font-semibold text-[#F5F3E7]"> ₹ {settings?.fundAmountByYear?.fourthYear || 200}</span>
                    </div>
                  </div>
                </div>

                {/* Your Amount (Green -> Accent Olive) */}
                <div 
                    // bg-green-50 -> Olive-Black Panel bg 
                    className="bg-[#1F221C]/80 border border-[#A6C36F]/40 rounded-lg p-4"
                >
                  {/* text-green-700 -> Text Secondary */}
                  <p className="text-sm text-[#E8E3C5]">Your Payment Amount:</p>
                  {/* text-green-900 -> Accent Olive */}
                  <p className="text-3xl font-bold text-[#A6C36F]">₹ {settings?.userAmount || 0}</p>
                </div>

                {/* QR Code */}
                {settings?.treasurerQRCode && (
                  <div 
                    // bg-gray-50 -> Olive-Black Panel bg 
                    className="bg-[#1F221C]/80 border border-[#3A3E36]/40 rounded-lg p-4 space-y-3"
                  >
                    {/* text-gray-900 -> Text Primary */}
                    <h3 className="font-semibold text-[#F5F3E7] flex items-center space-x-2">
                      {/* Icon text color */}
                      <QrCode className="w-5 h-5 text-[#A6C36F]" />
                      <span>Scan to Pay</span>
                    </h3>
                    <div className="flex justify-center">
                      <img
                        src={settings.treasurerQRCode}
                        alt="Payment QR Code"
                        // border-gray-300 -> Muted Olive-Gray
                        className="w-48 h-48 object-contain border-2 border-[#3A3E36] rounded-lg"
                      />
                    </div>
                  </div>
                )}

                {/* Important Note (Yellow -> Olive-Black/Accent) */}
                <div 
                    // bg-yellow-50 -> Olive-Black Panel bg 
                    className="bg-[#1F221C]/80 border border-[#A6C36F]/40 rounded-lg p-4 space-y-2"
                >
                  {/* text-yellow-900 -> Text Primary/Accent */}
                  <h3 className="font-semibold text-[#A6C36F]">📸 Important Note</h3>
                  {/* text-yellow-800 -> Text Secondary */}
                  <ul className="text-sm text-[#E8E3C5] space-y-1 list-disc list-inside">
                    <li>Take a clear screenshot of the payment confirmation</li>
                    <li>Upload the payment proof below</li>
                    <li>Ensure the transaction ID is visible</li>
                  </ul>
                </div>

                {/* Month Selection */}
                <div>
                  {/* text-gray-700 -> Text Secondary */}
                  <label className="block text-sm font-semibold text-[#E8E3C5] mb-2">
                    Select Month *
                  </label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    // Appearance: Darker background, beige text, olive ring
                    className="w-full px-4 py-3 border border-[#3A3E36] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent transition-all bg-[#0B0B09] text-[#F5F3E7]"
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
                  {/* text-gray-700 -> Text Secondary */}
                  <label className="block text-sm font-semibold text-[#E8E3C5] mb-2">
                    Upload Payment Proof *
                  </label>
                  
                  {!imagePreview ? (
                    <label 
                      // border-gray-300 -> Muted Olive-Gray, hover:border-blue-500/hover:bg-blue-50 -> hover:border-Accent/hover:bg-OliveBlack
                      className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#3A3E36] rounded-lg cursor-pointer hover:border-[#A6C36F] hover:bg-[#1F221C]/50 transition-all"
                    >
                      {/* text-gray-600 -> Text Secondary */}
                      <div className="flex flex-col items-center justify-center space-y-2 text-[#E8E3C5]">
                        {/* Icon color */}
                        <Upload className="w-10 h-10 text-[#A6C36F]" />
                        <p className="text-sm font-medium">Click to upload image</p>
                        {/* text-gray-500 -> Text Secondary/70 */}
                        <p className="text-xs text-[#E8E3C5]/70">JPG, PNG, or WEBP (Max 5MB)</p>
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
                        // border-gray-300 -> Muted Olive-Gray, bg-gray-50 -> Olive-Black Panel bg 
                        className="w-full h-64 object-contain border-2 border-[#3A3E36] rounded-lg bg-[#1F221C]/80"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        // bg-red-500 -> Accent Olive, hover:bg-red-600 -> Darker Olive
                        className="absolute top-2 right-2 p-2 bg-[#A6C36F] text-[#0B0B09] rounded-full hover:bg-[#8FAE5D] transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Notes (Optional) */}
                <div>
                  {/* text-gray-700 -> Text Secondary */}
                  <label className="block text-sm font-semibold text-[#E8E3C5] mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional information..."
                    rows={3}
                    // Appearance: Darker background, beige text, olive ring
                    className="w-full px-4 py-3 border border-[#3A3E36] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent transition-all resize-none bg-[#0B0B09] text-[#F5F3E7]"
                    maxLength={500}
                  />
                  {/* text-gray-500 -> Text Secondary/70 */}
                  <p className="text-xs text-[#E8E3C5]/70 mt-1">{notes.length}/500 characters</p>
                </div>

                {/* Action Buttons */}
                {/* border-gray-200 -> Muted Olive-Gray border-t */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#3A3E36]">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    // Cancel button: text-gray-700/bg-gray-100/hover:bg-gray-200 -> Text Secondary/Muted Olive-Gray/hover:Muted Olive-Gray
                    className="px-6 py-2.5 text-sm font-semibold text-[#E8E3C5] bg-[#3A3E36]/40 hover:bg-[#3A3E36]/60 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedMonth || !selectedImage}
                    // Submit button: (d) Button (Accent Olive)
                    className="px-6 py-2.5 text-sm font-semibold text-[#0B0B09] bg-[#A6C36F] hover:bg-[#8FAE5D] rounded-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        {/* Loader color is dark when text is dark */}
                        <Loader2 className="w-4 h-4 animate-spin text-[#0B0B09]" /> 
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        {/* Icon color is dark when text is dark */}
                        <ImageIcon className="w-4 h-4 text-[#0B0B09]" />
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