/**
 * Group Fund Controller
 * Handles monthly group fund payments using QR-based reference system
 */

import GroupFund from '../models/GroupFund.js';
import ClubSettings from '../models/ClubSettings.js';
import MonthlyGroupFundRecord from '../models/MonthlyGroupFundRecord.js';
import User from '../models/User.js';
import { generatePaymentReference, generateQRData } from '../utils/qrCodeUtils.js';

// Utility: mark overdue payments as Failed for a user
const markUserOverduePayments = async (userId) => {
  const now = new Date();
  await GroupFund.updateMany(
    {
      userId,
      status: { $in: ['Pending', 'AwaitingVerification'] },
      deadline: { $lt: now },
      memberConfirmedPayment: { $ne: true },
      verifiedBy: null,
    },
    {
      $set: { status: 'Failed' },
      $push: {
        statusHistory: {
          status: 'Failed',
          changedBy: userId,
          changedDate: now,
          reason: 'Marked failed because deadline passed without payment confirmation',
        },
      },
    }
  );
};

// Utility: recover records that were marked Failed but deadline not passed
const recoverUserPrematureFailures = async (userId) => {
  const now = new Date();
  await GroupFund.updateMany(
    {
      userId,
      status: 'Failed',
      deadline: { $gt: now },
      memberConfirmedPayment: { $ne: true },
      verifiedBy: null,
    },
    {
      $set: { status: 'Pending' },
      $push: {
        statusHistory: {
          status: 'Pending',
          changedBy: userId,
          changedDate: now,
          reason: 'Recovered to Pending because deadline not reached',
        },
      },
    }
  );
};

/**
 * @desc    Get all payment records for logged-in user
 * @route   GET /api/groupfund/my-payments
 * @access  Private
 */
export const getMyPayments = async (req, res) => {
  try {
    await recoverUserPrematureFailures(req.user._id);
    await markUserOverduePayments(req.user._id);

    const payments = await GroupFund.find({ userId: req.user._id })
      .sort({ year: -1, monthNumber: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    console.error('Error in getMyPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments',
      error: error.message
    });
  }
};

/**
 * @desc    Generate QR code for group fund payment
 * @route   POST /api/groupfund/generate-qr
 * @access  Private (Member)
 */
export const generateGroupFundQR = async (req, res) => {
  try {
    const { month, year, monthNumber, academicYear } = req.body;
    const yearNum = parseInt(year, 10);

    if (!month || !year || !monthNumber) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, and monthNumber are required'
      });
    }

    // Check if payment already exists
    let payment = await GroupFund.findOne({
      userId: req.user._id,
      month,
      year
    });

    if (payment && payment.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already completed for this month'
      });
    }

    // Get club settings with fallback to env for UPI
    const settings = await ClubSettings.findOne();
    const treasurerUPI = settings?.treasurerUPI || process.env.TREASURER_UPI;
    if (!treasurerUPI) {
      return res.status(500).json({
        success: false,
        message: 'Treasurer UPI not configured. Please contact treasurer.'
      });
    }

    // Get user details
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Determine amount and deadline from the active monthly record if it matches
    let amount = null;
    let deadline = null;
    const monthlyRecord = await MonthlyGroupFundRecord.findOne({
      status: 'active',
      month,
      year: yearNum,
      includedYears: user.year,
    });

    if (monthlyRecord) {
      // Use per-year amounts set by treasurer
      if (user.year === '1st') amount = monthlyRecord.amounts.firstYear;
      else if (user.year === '2nd') amount = monthlyRecord.amounts.secondYear;
      else if (user.year === '3rd') amount = monthlyRecord.amounts.thirdYear;
      else if (user.year === '4th') amount = monthlyRecord.amounts.fourthYear;

      deadline = monthlyRecord.deadline;
    }

    // Fallback to club settings if monthly record not found
    if (amount === null) {
      const fallbackAmounts = settings?.fundAmountByYear || {
        firstYear: 100,
        secondYear: 100,
        thirdYear: 100,
        fourthYear: 100,
      };

      if (user.year === '1st') amount = fallbackAmounts.firstYear;
      else if (user.year === '2nd') amount = fallbackAmounts.secondYear;
      else if (user.year === '3rd') amount = fallbackAmounts.thirdYear;
      else if (user.year === '4th') amount = fallbackAmounts.fourthYear;
      else amount = 100;

      deadline = new Date(yearNum, monthNumber - 1, settings?.paymentDeadlineDay || 10);
    }

    // Create or update payment with reference
    if (!payment) {
      const reference = generatePaymentReference('FUND', `${monthNumber}${year}`, req.user._id.toString());
      
      payment = new GroupFund({
        userId: req.user._id,
        academicYear: academicYear || `${yearNum}-${yearNum + 1}`,
        month,
        monthNumber,
        year: yearNum,
        amount,
        paymentMethod: 'UPI',
        status: 'Pending',
        paymentReference: reference,
        deadline,
        statusHistory: [{
          status: 'Pending',
          changedBy: req.user._id,
          changedDate: new Date(),
          reason: 'QR code generated'
        }]
      });
      await payment.save();
    } else {
      // Revive failed payments and align with latest treasurer amounts and deadline
      if (payment.status === 'Failed') {
        payment.status = 'Pending';
        payment.memberConfirmedPayment = false;
        payment.memberConfirmedDate = null;
        payment.paymentDate = null;
        payment.paymentProof = null;
        payment.verifiedBy = null;
        payment.verifiedDate = null;
        payment.statusHistory.push({
          status: 'Pending',
          changedBy: req.user._id,
          changedDate: new Date(),
          reason: 'Payment reopened after failure for new attempt'
        });
      }

      // Update existing pending/awaiting payment with latest details
      payment.amount = amount;
      payment.monthNumber = monthNumber;
      payment.deadline = deadline;
      payment.paymentMethod = 'UPI';
      if (!payment.paymentReference) {
        payment.paymentReference = generatePaymentReference('FUND', `${monthNumber}${yearNum}`, req.user._id.toString());
      }
      await payment.save();
    }

    const reference = payment.paymentReference;

    const qrData = generateQRData({
      type: 'FUND',
      paymentId: `${monthNumber}${year}`,
      userId: req.user._id.toString(),
      amount,
      treasurerUPI,
      fundName: `${month} ${yearNum} Group Fund`,
      referenceOverride: reference,
      memberName: user?.name,
      memberUsn: user?.usn,
    });

    res.status(200).json({
      success: true,
      qrData,
      payment,
      meta: {
        month,
        year,
        monthNumber,
        deadline,
      }
    });
  } catch (error) {
    console.error('Error in generateGroupFundQR:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

/**
 * @desc    Member confirms payment (after paying via UPI)
 * @route   POST /api/groupfund/confirm-payment/:id
 * @access  Private (Member)
 */
export const confirmPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await GroupFund.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (payment.memberConfirmedPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already confirmed'
      });
    }

    payment.memberConfirmedPayment = true;
    payment.memberConfirmedDate = new Date();
    payment.status = 'AwaitingVerification';
    payment.statusHistory.push({
      status: 'AwaitingVerification',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Member confirmed payment completion'
    });

    await payment.save();

    res.status(200).json({
      success: true,
      message: 'Payment confirmation received. Awaiting treasurer verification.',
      payment
    });
  } catch (error) {
    console.error('Error in confirmPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get club settings (for displaying payment info)
 * @route   GET /api/groupfund/settings
 * @access  Private
 */
export const getSettings = async (req, res) => {
  try {
    const settings = await ClubSettings.findOne();
    
    if (!settings) {
      return res.status(404).json({
        success: false,
        message: 'Club settings not found'
      });
    }

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Error in getSettings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment summary statistics for user
 * @route   GET /api/groupfund/summary
 * @access  Private
 */
export const getPaymentSummary = async (req, res) => {
  try {
    const summary = await GroupFund.getUserPaymentSummary(req.user._id);

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getPaymentSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get failed payments for user
 * @route   GET /api/groupfund/failed-payments
 * @access  Private
 */
export const getFailedPayments = async (req, res) => {
  try {
    const failedPayments = await GroupFund.find({
      userId: req.user._id,
      status: 'Failed'
    }).sort({ year: -1, monthNumber: -1 });

    res.status(200).json({
      success: true,
      count: failedPayments.length,
      payments: failedPayments
    });
  } catch (error) {
    console.error('Error in getFailedPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failed payments',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment status history
 * @route   GET /api/groupfund/payment-history/:id
 * @access  Private
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await GroupFund.findById(id)
      .populate('userId', 'name email usn')
      .populate('statusHistory.changedBy', 'name role');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check authorization (own payment or treasurer)
    if (payment.userId._id.toString() !== req.user._id.toString() && req.user.role !== 'treasurer') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    res.status(200).json({
      success: true,
      payment,
      history: payment.statusHistory
    });
  } catch (error) {
    console.error('Error in getPaymentHistory:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

/**
 * @desc    Regenerate QR for failed payment
 * @route   POST /api/groupfund/resubmit-payment/:id
 * @access  Private (Member)
 */
export const resubmitPayment = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await GroupFund.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    // Check ownership
    if (payment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (payment.status !== 'Failed' && payment.status !== 'Rejected') {
      return res.status(400).json({
        success: false,
        message: 'Can only resubmit failed or rejected payments'
      });
    }

    // Get club settings
    const settings = await ClubSettings.findOne();
    if (!settings || !settings.treasurerUPI) {
      return res.status(500).json({
        success: false,
        message: 'Treasurer UPI not configured'
      });
    }

    // Generate new reference
    const newReference = generatePaymentReference('FUND', `${payment.monthNumber}${payment.year}`, req.user._id.toString());
    
    // Reset payment status
    payment.paymentReference = newReference;
    payment.status = 'Pending';
    payment.memberConfirmedPayment = false;
    payment.memberConfirmedDate = null;
    payment.statusHistory.push({
      status: 'Pending',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Payment resubmitted - new QR generated'
    });

    await payment.save();

    // Generate new QR data
    const qrData = generateQRData({
      type: 'FUND',
      paymentId: `${payment.monthNumber}${payment.year}`,
      userId: req.user._id.toString(),
      amount: payment.amount,
      treasurerUPI: settings.treasurerUPI,
      fundName: `${payment.month} ${payment.year} Group Fund`
    });

    res.status(200).json({
      success: true,
      message: 'New QR code generated for resubmission',
      qrData,
      payment
    });
  } catch (error) {
    console.error('Error in resubmitPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resubmit payment',
      error: error.message
    });
  }
};

/**
 * Legacy function - no longer needed with QR system
 * Kept for backward compatibility
 */
export const submitPayment = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Please use the new QR-based payment system'
  });
};

/**
 * Legacy function - no longer needed with QR system
 */
export const downloadPaymentProof = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Screenshot system has been replaced with QR-based payments'
  });
};

/**
 * Legacy function - no longer needed with QR system
 */
export const verifyResubmittedPayment = async (req, res) => {
  return res.status(400).json({
    success: false,
    message: 'Please use the new reference-based verification system'
  });
};
