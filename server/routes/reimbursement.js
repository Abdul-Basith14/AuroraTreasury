import express from 'express';
import {
  createReimbursementRequest,
  getMyRequests,
  getRequestById,
  confirmReceipt,
  deleteRequest,
  getStatistics,
} from '../controllers/reimbursementController.js';
import { protect } from '../middleware/auth.js';
import { uploadReimbursementBill, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * All routes require authentication
 * Apply protect middleware to all routes
 */

/**
 * @route   POST /api/reimbursement/request
 * @desc    Create a new reimbursement request with bill proof photo
 * @access  Private (Member)
 * 
 * This route handles multipart/form-data with bill proof photo
 * Required fields: name, year, mobileNumber, description, amount, billProof (file)
 * Accepted file types: JPG, PNG, HEIC, WEBP, PDF
 * Max file size: 10MB
 */
router.post(
  '/request',
  protect,
  uploadReimbursementBill, // Multer middleware to handle bill photo upload
  handleUploadError, // Error handler for upload errors
  createReimbursementRequest // Controller function
);

/**
 * @route   GET /api/reimbursement/my-requests
 * @desc    Get all reimbursement requests for logged-in user
 * @access  Private (Member)
 * 
 * Returns:
 * - Array of reimbursement requests with treasurer response details
 * - Summary statistics (total, pending, approved, paid, received, rejected)
 * - Sorted by newest first
 */
router.get('/my-requests', protect, getMyRequests);

/**
 * @route   GET /api/reimbursement/request/:id
 * @desc    Get a single reimbursement request by ID
 * @access  Private (Member - own requests only)
 * 
 * Returns complete request details including treasurer response
 */
router.get('/request/:id', protect, getRequestById);

/**
 * @route   POST /api/reimbursement/confirm-receipt/:id
 * @desc    Confirm receipt of payment from treasurer
 * @access  Private (Member)
 * 
 * Updates status from 'Paid' to 'Received'
 * Sets receivedDate to current date
 * Only works if status is 'Paid'
 */
router.post('/confirm-receipt/:id', protect, confirmReceipt);

/**
 * @route   DELETE /api/reimbursement/request/:id
 * @desc    Delete a reimbursement request
 * @access  Private (Member - own requests only)
 * 
 * Can only delete requests with status 'Pending' or 'Rejected'
 * Cannot delete 'Approved', 'Paid', or 'Received' requests
 * Also deletes bill proof photo from Cloudinary
 */
router.delete('/request/:id', protect, deleteRequest);

/**
 * @route   GET /api/reimbursement/statistics
 * @desc    Get reimbursement statistics for logged-in user
 * @access  Private (Member)
 * 
 * Returns statistics by status and amounts
 */
router.get('/statistics', protect, getStatistics);

export default router;
