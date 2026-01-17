import express from 'express';
import {
  getMembers,
  getMemberPayments,
  getStatistics,
  getFailedPaymentsSummary,
  getMonthBasedMemberList,
  createMonthlyRecordsForAll,
  deleteMonthlyRecords,
  getWallet,
  addMoneyToWallet,
  removeMoneyFromWallet,
  getPaymentRequests,
  verifyPayment,
  rejectPayment,
  getResubmissionRequests,
  verifyResubmission,
  rejectResubmission,
  createManualPayment,
  manualPaymentUpdate,
  createMonthlyGroupFundRecord,
  getMonthlyGroupFundRecords,
  updateMonthlyGroupFundRecord,
  deleteMonthlyGroupFundRecord,
  setTreasurerUPI,
  getTreasurerUPISettings
} from '../controllers/treasurerController.js';
import { protect } from '../middleware/auth.js';
import treasurerAuth from '../middleware/treasurerAuth.js';

const router = express.Router();

/**
 * All routes require authentication and treasurer role
 * Apply protect and treasurerAuth middleware to all routes
 */
router.use(protect);
router.use(treasurerAuth);

/**
 * @route   GET /api/treasurer/members
 * @desc    Get all members with payment statistics
 * @access  Private (Treasurer only)
 * @params  Query: year (all/1st/2nd/3rd/4th), status (all/paid/pending/failed), search (string)
 */
router.get('/members', getMembers);

/**
 * @route   GET /api/treasurer/member/:userId/payments
 * @desc    Get all payments for a specific member
 * @access  Private (Treasurer only)
 */
router.get('/member/:userId/payments', getMemberPayments);

/**
 * @route   GET /api/treasurer/statistics
 * @desc    Get dashboard statistics (total members, collections, failed payments, etc.)
 * @access  Private (Treasurer only)
 */
router.get('/statistics', getStatistics);

/**
 * @route   GET /api/treasurer/failed-payments-summary
 * @desc    Get summary of all failed payments grouped by month
 * @access  Private (Treasurer only)
 */
router.get('/failed-payments-summary', getFailedPaymentsSummary);

/**
 * @route   GET /api/treasurer/member-list/:month/:year
 * @desc    Get month-based member list with payment status
 * @access  Private (Treasurer only)
 * @example /api/treasurer/member-list/November/2024
 */
router.get('/member-list/:month/:year', getMonthBasedMemberList);

/**
 * @route   POST /api/treasurer/create-monthly-records
 * @desc    Create payment records for all members for a specific month
 * @access  Private (Treasurer only)
 * @body    { month: string, year: number, amount: number, deadline: Date }
 */
router.post('/create-monthly-records', createMonthlyRecordsForAll);

/**
 * @route   DELETE /api/treasurer/delete-monthly-records/:month/:year
 * @desc    Delete all payment records for a specific month
 * @access  Private (Treasurer only)
 * @example DELETE /api/treasurer/delete-monthly-records/November/2024
 */
router.delete('/delete-monthly-records/:month/:year', deleteMonthlyRecords);

/**
 * @route   GET /api/treasurer/wallet
 * @desc    Get wallet balance and transaction history
 * @access  Private (Treasurer only)
 */
router.get('/wallet', getWallet);

/**
 * @route   POST /api/treasurer/wallet/add
 * @desc    Add money to wallet
 * @access  Private (Treasurer only)
 * @body    { amount: number, description: string }
 */
router.post('/wallet/add', addMoneyToWallet);

/**
 * @route   POST /api/treasurer/wallet/remove
 * @desc    Remove money from wallet
 * @access  Private (Treasurer only)
 * @body    { amount: number, description: string }
 */
router.post('/wallet/remove', removeMoneyFromWallet);

/**
 * @route   GET /api/treasurer/payment-requests
 * @desc    Get all pending payment requests that need verification
 * @access  Private (Treasurer only)
 * @params  Query: status (Pending/all), month, year
 */
router.get('/payment-requests', getPaymentRequests);

/**
 * @route   POST /api/treasurer/verify-payment/:paymentId
 * @desc    Verify and approve a payment request
 * @access  Private (Treasurer only)
 */
router.post('/verify-payment/:paymentId', verifyPayment);

/**
 * @route   POST /api/treasurer/reject-payment/:paymentId
 * @desc    Reject a payment request with reason
 * @access  Private (Treasurer only)
 * @body    { reason: string }
 */
router.post('/reject-payment/:paymentId', rejectPayment);

/**
 * @route   GET /api/treasurer/resubmission-requests
 * @desc    Get all resubmitted payment requests that need verification
 * @access  Private (Treasurer only)
 */
router.get('/resubmission-requests', getResubmissionRequests);

/**
 * @route   POST /api/treasurer/verify-resubmission/:paymentId
 * @desc    Verify and approve a resubmitted payment request
 * @access  Private (Treasurer only)
 */
router.post('/verify-resubmission/:paymentId', verifyResubmission);

/**
 * @route   POST /api/treasurer/reject-resubmission/:paymentId
 * @desc    Reject a resubmitted payment request with reason
 * @access  Private (Treasurer only)
 * @body    { reason: string }
 */
router.post('/reject-resubmission/:paymentId', rejectResubmission);

/**
 * @route   POST /api/treasurer/create-manual-payment
 * @desc    Create and mark payment as paid for members who paid cash/offline
 * @access  Private (Treasurer only)
 * @body    { userId: string, month: string, year: number, amount: number, paymentMethod: string, note?: string }
 */
router.post('/create-manual-payment', createManualPayment);

/**
 * @route   POST /api/treasurer/manual-payment-update/:paymentId
 * @desc    Manually mark payment as paid for cash/offline payments
 * @access  Private (Treasurer only)
 * @body    { paymentMethod: string ('Cash'|'Bank Transfer'|'Other'), note?: string }
 */
router.post('/manual-payment-update/:paymentId', manualPaymentUpdate);

/**
 * @route   POST /api/treasurer/monthly-record
 * @desc    Create a new monthly group fund record
 * @access  Private (Treasurer only)
 * @body    { month: string, year: number, deadline: Date, amounts: object, includedYears: array }
 */
router.post('/monthly-record', createMonthlyGroupFundRecord);

/**
 * @route   GET /api/treasurer/monthly-records
 * @desc    Get all monthly group fund records
 * @access  Private (Treasurer only)
 */
router.get('/monthly-records', getMonthlyGroupFundRecords);

/**
 * @route   PUT /api/treasurer/monthly-record/:id
 * @desc    Update a monthly group fund record
 * @access  Private (Treasurer only)
 * @body    { deadline?: Date, amounts?: object, includedYears?: array, status?: string }
 */
router.put('/monthly-record/:id', updateMonthlyGroupFundRecord);

/**
 * @route   DELETE /api/treasurer/monthly-record/:id
 * @desc    Delete a monthly group fund record
 * @access  Private (Treasurer only)
 */
router.delete('/monthly-record/:id', deleteMonthlyGroupFundRecord);

/**
 * @route   GET /api/treasurer/upi
 * @desc    Get Treasurer UPI settings and history
 * @access  Private (Treasurer only)
 */
router.get('/upi', getTreasurerUPISettings);

/**
 * @route   POST /api/treasurer/upi
 * @desc    Set or update Treasurer UPI ID
 * @access  Private (Treasurer only)
 */
router.post('/upi', setTreasurerUPI);

export default router;
