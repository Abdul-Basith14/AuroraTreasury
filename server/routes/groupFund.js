import express from 'express';
import {
  getMyPayments,
  submitPayment,
  getSettings,
  downloadPaymentProof,
  getPaymentSummary,
} from '../controllers/groupFundController.js';
import { protect } from '../middleware/auth.js';
import { uploadPaymentProof, handleUploadError } from '../middleware/upload.js';

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

export default router;
