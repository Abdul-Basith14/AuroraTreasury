import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

/**
 * Configure Cloudinary storage for Multer
 * Images will be uploaded directly to Cloudinary
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/payment-proofs', // Folder in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], // Allowed image formats
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Limit image size
  },
});

/**
 * File filter to accept only images
 * @param {Object} req - Express request object
 * @param {Object} file - Multer file object
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'), false);
  }
};

/**
 * Multer configuration
 * - Storage: Cloudinary
 * - File size limit: 5MB
 * - File filter: Images only
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Middleware to handle single image upload with field name 'paymentProof'
 */
export const uploadPaymentProof = upload.single('paymentProof');

/**
 * Middleware to handle multiple image uploads (for future use)
 */
export const uploadMultipleImages = upload.array('images', 5); // Max 5 images

/**
 * Configure Cloudinary storage for Reimbursement Bills
 * Supports images and PDFs with larger file size limit
 */
const reimbursementStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/reimbursement-bills', // Separate folder for reimbursement bills
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'heic', 'webp'], // Allow images and PDFs
    transformation: [{ width: 1200, height: 1600, crop: 'limit' }], // Larger limit for bills
    resource_type: 'auto', // Auto-detect resource type (image or raw for PDF)
  },
});

/**
 * File filter for reimbursement bills (images and PDFs)
 */
const reimbursementFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, HEIC, WEBP) and PDF files are allowed'), false);
  }
};

/**
 * Multer configuration for reimbursement bills
 * - Storage: Cloudinary
 * - File size limit: 10MB (larger for bills/receipts)
 * - File filter: Images and PDFs
 */
const reimbursementUpload = multer({
  storage: reimbursementStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for bills
  },
  fileFilter: reimbursementFileFilter,
});

/**
 * Middleware to handle single reimbursement bill upload with field name 'billProof'
 */
export const uploadReimbursementBill = reimbursementUpload.single('billProof');

/**
 * Configure Cloudinary storage for Failed Payment Resubmissions
 * Separate folder for tracking resubmitted payment proofs
 */
const resubmissionStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/failed-payment-resubmissions', // Separate folder for resubmissions
    allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'webp'], // Allow common image formats
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }], // Limit image size
  },
});

/**
 * File filter for resubmission payment proofs (images only)
 */
const resubmissionFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, HEIC, WEBP) are allowed'), false);
  }
};

/**
 * Multer configuration for resubmission payment proofs
 * - Storage: Cloudinary
 * - File size limit: 5MB
 * - File filter: Images only
 */
const resubmissionUpload = multer({
  storage: resubmissionStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: resubmissionFileFilter,
});

/**
 * Middleware to handle resubmission payment proof upload with field name 'paymentProof'
 */
export const uploadResubmissionProof = resubmissionUpload.single('paymentProof');

/**
 * Configure Cloudinary storage for Treasurer's Reimbursement Payment Proofs
 */
const reimbursementPaymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/reimbursement-payments', // Separate folder for treasurer payments
    allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  },
});

/**
 * Multer configuration for treasurer's reimbursement payment proofs
 * - Storage: Cloudinary
 * - File size limit: 5MB
 * - File filter: Images only
 */
const reimbursementPaymentUpload = multer({
  storage: reimbursementPaymentStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: resubmissionFileFilter, // Reuse the same file filter
});

/**
 * Middleware to handle treasurer's reimbursement payment proof uploads
 */
export const uploadReimbursementPaymentProof = reimbursementPaymentUpload.single('paymentProof');

/**
 * Configure Cloudinary storage for Party Payment Proofs
 * Supports images and PDFs and larger sizes if needed
 */
const partyPaymentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/party-payment-proofs',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'heic', 'pdf'],
    transformation: [{ width: 1200, height: 1600, crop: 'limit' }],
    resource_type: 'auto',
  },
});

const partyPaymentUpload = multer({
  storage: partyPaymentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: reimbursementFileFilter,
});

// Export middleware to handle multiple paymentProofs files (max 5)
export const uploadPartyPaymentProof = partyPaymentUpload.array('paymentProofs', 5);

/**
 * Configure Cloudinary storage for Profile Photos
 * Keeps profile uploads separate from payment proofs
 */
const profilePhotoStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'aurora-treasury/profile-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'heic', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }],
  },
});

const profilePhotoUpload = multer({
  storage: profilePhotoStorage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: fileFilter,
});

export const uploadProfilePhoto = profilePhotoUpload.single('profilePhoto');

/**
 * Error handling middleware for Multer
 * Usage: Add this after routes that use upload middleware
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB for bills or 5MB for payment proofs.',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected field in form data.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  } else if (err) {
    // Other errors (like file type validation)
    return res.status(400).json({
      success: false,
      message: err.message || 'Error uploading file.',
    });
  }
  next();
};

/**
 * Helper function to delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID of the image
 * @returns {Promise} - Cloudinary delete response
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Helper function to extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const getPublicIdFromUrl = (url) => {
  const parts = url.split('/');
  const fileWithExtension = parts[parts.length - 1];
  const publicId = fileWithExtension.split('.')[0];
  return `aurora-treasury/payment-proofs/${publicId}`;
};

export default upload;
