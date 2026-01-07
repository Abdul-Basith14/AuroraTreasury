import express from 'express';
import {
  getMyPayments,
  submitPayment,
  getSettings,
  downloadPaymentProof,
  getPaymentSummary,
  getFailedPayments,
  resubmitPayment,
  getPaymentHistory,
  verifyResubmittedPayment,
} from '../controllers/groupFundController.js';
import { protect } from '../middleware/auth.js';
import { uploadPaymentProof, uploadResubmissionProof, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * All routes require authentication
 * Apply protect middleware to all routes
 */

/**
 * @route   GET /api/groupfund/my-payments
 * @desc    Get all payment records for logged-in user
 * @access  Private
 */
router.get('/my-payments', protect, getMyPayments);

/**
 * @route   POST /api/groupfund/submit-payment
 * @desc    Submit payment proof with image upload
 * @access  Private
 * 
 * This route handles multipart/form-data with image file
 * Required fields: month, year, monthNumber, paymentProof (file)
 * Optional fields: notes, academicYear
 */
router.post(
  '/submit-payment',
  protect,
  uploadPaymentProof, // Multer middleware to handle file upload
  handleUploadError, // Error handler for upload errors
  submitPayment // Controller function
);

/**
 * @route   GET /api/groupfund/settings
 * @desc    Get club settings (QR code, payment info, amounts)
 * @access  Private
 */
router.get('/settings', protect, getSettings);

/**
 * @route   GET /api/groupfund/download-proof/:id
 * @desc    Get payment proof URL for a specific payment
 * @access  Private (own payments or treasurer)
 */
router.get('/download-proof/:id', protect, downloadPaymentProof);

/**
 * @route   GET /api/groupfund/summary
 * @desc    Get payment summary statistics
 * @access  Private
 */
router.get('/summary', protect, getPaymentSummary);

/**
 * @route   GET /api/groupfund/failed-payments
 * @desc    Get all failed payments for logged-in user
 * @access  Private (Member)
 */
router.get('/failed-payments', protect, getFailedPayments);

/**
 * @route   POST /api/groupfund/resubmit-payment/:id
 * @desc    Resubmit payment proof for a failed payment
 * @access  Private (Member)
 * 
 * This route handles multipart/form-data with image file
 * Required fields: paymentProof (file)
 * Optional fields: note
 */
router.post(
  '/resubmit-payment/:id',
  protect,
  uploadResubmissionProof, // Multer middleware for resubmission upload
  handleUploadError, // Error handler for upload errors
  resubmitPayment // Controller function
);

/**
 * @route   GET /api/groupfund/payment-history/:id
 * @desc    Get payment status history for a specific payment
 * @access  Private (Member - own payments, Treasurer - all)
 */
router.get('/payment-history/:id', protect, getPaymentHistory);

/**
 * @route   POST /api/groupfund/verify-resubmission/:id
 * @desc    Verify resubmitted payment (Treasurer only)
 * @access  Private (Treasurer)
 */
router.post('/verify-resubmission/:id', protect, verifyResubmittedPayment);

export default router;
