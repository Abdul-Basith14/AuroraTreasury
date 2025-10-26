import { useState, useEffect } from 'react';
import { X, Upload, FileText, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { reimbursementAPI } from '../../utils/api';

/**
 * ReimbursementRequestModal Component
 * Form modal for members to submit reimbursement requests with bill proof
 * 
 * @param {Boolean} isOpen - Modal visibility state
 * @param {Function} onClose - Callback to close modal
 * @param {Object} userData - Current user data for pre-filling form
 * @param {Function} onSuccess - Callback after successful submission
 */
const ReimbursementRequestModal = ({ isOpen, onClose, userData, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    year: '',
    mobileNumber: '',
    description: '',
    amount: '',
  });

  const [billPhoto, setBillPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen && userData) {
      setFormData({
        name: userData.name || '',
        year: userData.year ? `${userData.year} Year` : '',
        mobileNumber: '',
        description: '',
        amount: '',
      });
    }
  }, [isOpen, userData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        year: '',
        mobileNumber: '',
        description: '',
        amount: '',
      });
      setBillPhoto(null);
      setPhotoPreview(null);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    if (!formData.year) {
      newErrors.year = 'Please select your academic year';
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!formData.mobileNumber || !mobileRegex.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Enter valid 10-digit mobile number starting with 6-9';
    }

    if (!formData.description || formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!billPhoto) {
      newErrors.billPhoto = 'Bill proof is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file upload
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload an image (JPG, PNG, HEIC, WEBP) or PDF file');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setBillPhoto(file);
    setErrors({ ...errors, billPhoto: null });

    // Create preview (only for images, not PDF)
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPhotoPreview('pdf'); // Special indicator for PDF
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix all errors before submitting');
      return;
    }

    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('mobileNumber', formData.mobileNumber);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('amount', formData.amount);
      formDataToSend.append('billProof', billPhoto);

      await reimbursementAPI.createRequest(formDataToSend);

      toast.success('Reimbursement request submitted! Treasurer will review it soon.');
      onSuccess(); // Refresh parent component
      onClose(); // Close modal
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-t-2xl flex justify-between items-center z-10">
            <div>
              <h2 className="text-xl font-bold">Request Reimbursement</h2>
              <p className="text-sm text-white text-opacity-90">Fill in the details of your club purchase</p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your full name"
                disabled={submitting}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1.5">{errors.name}</p>}
            </div>

            {/* Year Selection - Radio Buttons */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {['1st', '2nd', '3rd', '4th'].map((year) => (
                  <button
                    key={year}
                    type="button"
                    onClick={() => setFormData({ ...formData, year: `${year} Year` })}
                    disabled={submitting}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition ${
                      formData.year === `${year} Year`
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-300 text-gray-700 hover:border-purple-300'
                    } disabled:opacity-50`}
                  >
                    {year}
                  </button>
                ))}
              </div>
              {errors.year && <p className="text-red-500 text-xs mt-1.5">{errors.year}</p>}
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border-2 border-r-0 border-gray-300 bg-gray-50 text-gray-600 font-medium">
                  +91
                </span>
                <input
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '') })
                  }
                  maxLength="10"
                  className={`flex-1 px-4 py-3 border-2 rounded-r-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.mobileNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="9876543210"
                  disabled={submitting}
                />
              </div>
              {errors.mobileNumber && <p className="text-red-500 text-xs mt-1.5">{errors.mobileNumber}</p>}
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                maxLength="500"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe what you purchased for the club (e.g., props for annual day play, costumes, printing materials, etc.)"
                disabled={submitting}
              />
              <div className="flex justify-between items-center mt-1.5">
                {errors.description ? (
                  <p className="text-red-500 text-xs">{errors.description}</p>
                ) : (
                  <p className="text-gray-500 text-xs">Min 10 characters</p>
                )}
                <p className="text-gray-500 text-xs">{formData.description.length}/500</p>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition ${
                    errors.amount ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  disabled={submitting}
                />
              </div>
              {errors.amount && <p className="text-red-500 text-xs mt-1.5">{errors.amount}</p>}
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Upload Bill/Payment Proof <span className="text-red-500">*</span>
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-purple-400 transition cursor-pointer ${
                  errors.billPhoto ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handlePhotoChange}
                  className="hidden"
                  id="bill-upload"
                  disabled={submitting}
                />
                <label htmlFor="bill-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-1 font-medium">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-gray-500">JPG, PNG, PDF, HEIC, WEBP (Max 10MB)</p>
                </label>
              </div>

              {/* Photo Preview */}
              {photoPreview && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center justify-between border-2 border-gray-200">
                  {photoPreview === 'pdf' ? (
                    <div className="flex items-center">
                      <FileText className="w-10 h-10 text-red-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{billPhoto.name}</p>
                        <p className="text-xs text-gray-500">
                          {(billPhoto.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-16 h-16 object-cover rounded border-2 border-gray-300 mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-700">{billPhoto.name}</p>
                        <p className="text-xs text-gray-500">
                          {(billPhoto.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setBillPhoto(null);
                      setPhotoPreview(null);
                    }}
                    disabled={submitting}
                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
              {errors.billPhoto && <p className="text-red-500 text-xs mt-1.5">{errors.billPhoto}</p>}
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-800 mb-2">Important Notes:</p>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Upload a CLEAR photo of the bill/receipt</li>
                    <li>• Make sure the amount is clearly visible</li>
                    <li>• Include transaction details if it's a UPI payment</li>
                    <li>• Treasurer will verify and process your payment</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold flex items-center transition shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  <>Submit Request →</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ReimbursementRequestModal;
