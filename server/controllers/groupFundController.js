import GroupFund from '../models/GroupFund.js';
import ClubSettings from '../models/ClubSettings.js';
import User from '../models/User.js';

/**
 * @desc    Get all payment records for logged-in user
 * @route   GET /api/groupfund/my-payments
 * @access  Private (Member/Treasurer)
 */
export const getMyPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all payment records for the user, sorted by year and month (newest first)
    // Exclude records that are intentionally hidden from members (visibleToMember === false)
    const payments = await GroupFund.find({ userId, visibleToMember: { $ne: false } })
      .sort({ year: -1, monthNumber: -1 })
      .lean();

    // Calculate total paid amount
    const totalPaid = payments
      .filter((payment) => payment.status === 'Paid')
      .reduce((sum, payment) => sum + payment.amount, 0);

    // Calculate summary statistics
    const summary = {
      totalPaid,
      totalPending: payments.filter((p) => p.status === 'Pending').length,
      totalFailed: payments.filter((p) => p.status === 'Failed').length,
      totalRecords: payments.length,
    };

    res.status(200).json({
      success: true,
      data: {
        payments,
        summary,
      },
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment records',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit payment proof for a specific month
 * @route   POST /api/groupfund/submit-payment
 * @access  Private (Member)
 */
export const submitPayment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { month, year, monthNumber, academicYear, notes } = req.body;

    // Validate required fields
    if (!month || !year || !monthNumber) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, and monthNumber are required',
      });
    }

    // Check if payment proof file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof image is required',
      });
    }

    // Get payment proof URL from Cloudinary
    const paymentProof = req.file.path;

    // Get club settings to determine payment amount
    const settings = await ClubSettings.findOne({ isActive: true });
    
    // Use default settings if not configured
    const defaultAmounts = {
      firstYear: 50,
      secondYear: 100,
      thirdYear: 150,
      fourthYear: 200,
      monthlyFundAmount: 100,
      paymentDeadlineDay: 5,
      academicYear: '2024-2025'
    };

    const fundAmounts = settings ? settings.fundAmountByYear : defaultAmounts;
    const paymentDeadlineDay = settings ? settings.paymentDeadlineDay : defaultAmounts.paymentDeadlineDay;
    const defaultAcademicYear = settings ? settings.academicYear : defaultAmounts.academicYear;

    if (!settings) {
      console.warn('⚠️  WARNING: Club settings not configured. Using default payment amounts.');
    }

    // Get user details to determine year and calculate amount
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Calculate payment amount based on user's academic year
    let amount = 0;
    switch (user.year) {
      case '1st':
        amount = fundAmounts.firstYear;
        break;
      case '2nd':
        amount = fundAmounts.secondYear;
        break;
      case '3rd':
        amount = fundAmounts.thirdYear;
        break;
      case '4th':
        amount = fundAmounts.fourthYear;
        break;
      default:
        amount = settings ? settings.monthlyFundAmount : defaultAmounts.monthlyFundAmount;
    }

    // Calculate deadline (paymentDeadlineDay of the given month)
    const deadline = new Date(year, monthNumber - 1, paymentDeadlineDay);

    // Check if payment record already exists for this month
    const existingPayment = await GroupFund.findOne({
      userId,
      month,
      year,
    });

    let payment;

    if (existingPayment) {
      // Update existing record
      existingPayment.paymentProof = paymentProof;
      existingPayment.status = 'Pending'; // Reset to pending for verification
      existingPayment.submittedDate = new Date();
      existingPayment.amount = amount;
      existingPayment.deadline = deadline;
      existingPayment.academicYear = academicYear || defaultAcademicYear;
      if (notes) existingPayment.notes = notes;

      payment = await existingPayment.save();
    } else {
      // Create new payment record
      payment = await GroupFund.create({
        userId,
        academicYear: academicYear || defaultAcademicYear,
        month,
        monthNumber: parseInt(monthNumber),
        year: parseInt(year),
        amount,
        status: 'Pending',
        paymentProof,
        submittedDate: new Date(),
        deadline,
        notes: notes || '',
      });
    }

    res.status(201).json({
      success: true,
      message: 'Payment proof submitted successfully. Awaiting treasurer verification.',
      data: payment,
    });
  } catch (error) {
    console.error('Error submitting payment:', error);

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Payment record for this month already exists',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error submitting payment proof',
      error: error.message,
    });
  }
};

/**
 * @desc    Get club settings (QR code, payment instructions, amounts)
 * @route   GET /api/groupfund/settings
 * @access  Private (Member/Treasurer)
 */
export const getSettings = async (req, res) => {
  try {
    // Fetch active club settings
    const settings = await ClubSettings.findOne({ isActive: true });

    // If no settings, use default values for testing
    if (!settings) {
      console.warn('⚠️  WARNING: Club settings not configured. Using default values.');
      
      const defaultSettings = {
        treasurerQRCode: null,
        paymentInstructions: 'Please pay the monthly group fund amount.',
        fundAmountByYear: {
          firstYear: 50,
          secondYear: 100,
          thirdYear: 150,
          fourthYear: 200
        },
        paymentDeadlineDay: 5,
        academicYear: '2024-2025',
        monthlyFundAmount: 100
      };

      const user = req.user;
      let userAmount = 100; // Default amount

      switch (user.year) {
        case '1st':
          userAmount = defaultSettings.fundAmountByYear.firstYear;
          break;
        case '2nd':
          userAmount = defaultSettings.fundAmountByYear.secondYear;
          break;
        case '3rd':
          userAmount = defaultSettings.fundAmountByYear.thirdYear;
          break;
        case '4th':
          userAmount = defaultSettings.fundAmountByYear.fourthYear;
          break;
        default:
          userAmount = defaultSettings.monthlyFundAmount;
      }

      return res.status(200).json({
        success: true,
        data: {
          ...defaultSettings,
          userAmount,
          isDefaultSettings: true // Flag to indicate these are defaults
        },
      });
    }

    // Get user's year to determine payment amount
    const user = req.user;
    let userAmount = 0;

    switch (user.year) {
      case '1st':
        userAmount = settings.fundAmountByYear.firstYear;
        break;
      case '2nd':
        userAmount = settings.fundAmountByYear.secondYear;
        break;
      case '3rd':
        userAmount = settings.fundAmountByYear.thirdYear;
        break;
      case '4th':
        userAmount = settings.fundAmountByYear.fourthYear;
        break;
      default:
        userAmount = settings.monthlyFundAmount;
    }

    res.status(200).json({
      success: true,
      data: {
        treasurerQRCode: settings.treasurerQRCode,
        paymentInstructions: settings.paymentInstructions,
        fundAmountByYear: settings.fundAmountByYear,
        paymentDeadlineDay: settings.paymentDeadlineDay,
        academicYear: settings.academicYear,
        userAmount, // Amount specific to logged-in user
      },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching club settings',
      error: error.message,
    });
  }
};

/**
 * @desc    Download payment proof for a specific payment
 * @route   GET /api/groupfund/download-proof/:id
 * @access  Private (Member - own payments only, Treasurer - all payments)
 */
export const downloadPaymentProof = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find the payment record
    const payment = await GroupFund.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Check authorization - user can only view their own payments unless they're treasurer
    if (userRole !== 'treasurer' && payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this payment proof',
      });
    }

    // Check if payment proof exists
    if (!payment.paymentProof) {
      return res.status(404).json({
        success: false,
        message: 'No payment proof found for this record',
      });
    }

    // Return the Cloudinary URL
    res.status(200).json({
      success: true,
      data: {
        paymentProofUrl: payment.paymentProof,
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
      },
    });
  } catch (error) {
    console.error('Error downloading payment proof:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving payment proof',
      error: error.message,
    });
  }
};

/**
 * @desc    Get payment summary statistics for user
 * @route   GET /api/groupfund/summary
 * @access  Private (Member)
 */
export const getPaymentSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    // Use the static method from GroupFund model
    const summary = await GroupFund.getUserPaymentSummary(userId);

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error('Error fetching payment summary:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment summary',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all failed payments for logged-in user
 * @route   GET /api/groupfund/failed-payments
 * @access  Private (Member)
 */
export const getFailedPayments = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all failed payment records for the user, sorted by year and month (newest first)
    const failedPayments = await GroupFund.find({
      userId,
      status: 'Failed',
    })
      .sort({ year: -1, monthNumber: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: failedPayments.length,
      payments: failedPayments,
    });
  } catch (error) {
    console.error('Error fetching failed payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failed payments',
      error: error.message,
    });
  }
};

/**
 * @desc    Resubmit payment proof for a failed payment
 * @route   POST /api/groupfund/resubmit-payment/:id
 * @access  Private (Member)
 */
export const resubmitPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const userId = req.user._id;

    // Find the payment record
    const payment = await GroupFund.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Verify ownership - only the owner can resubmit
    if (payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    // Check if status is Failed
    if (payment.status !== 'Failed') {
      return res.status(400).json({
        success: false,
        message: 'Can only resubmit payment for failed records',
      });
    }

    // Check if already has a pending resubmission
    if (
      payment.failedPaymentSubmission &&
      payment.failedPaymentSubmission.resubmittedPhoto
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment resubmission is already pending treasurer verification',
      });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Payment proof photo is required',
      });
    }

    console.log(`📝 User ${userId} resubmitting payment ${id}`);
    console.log(`   Proof URL: ${req.file.path}`);

    // Update payment record with resubmission
    // Directly modify the nested object properties to ensure change tracking
    if (!payment.failedPaymentSubmission) {
      payment.failedPaymentSubmission = {};
    }
    
    payment.failedPaymentSubmission.resubmittedPhoto = req.file.path;
    payment.failedPaymentSubmission.resubmittedDate = new Date();
    payment.failedPaymentSubmission.resubmissionNote = note || '';
    
    // Explicitly mark as modified to ensure Mongoose saves it
    payment.markModified('failedPaymentSubmission');

    // Add to status history
    payment.statusHistory.push({
      status: 'Failed',
      changedBy: userId,
      changedDate: new Date(),
      reason: 'Member resubmitted payment proof for failed payment',
    });

    const savedPayment = await payment.save();
    console.log('✅ Payment resubmission saved successfully');
    console.log('   New Resubmission Data:', savedPayment.failedPaymentSubmission);

    res.status(200).json({
      success: true,
      message:
        'Payment proof resubmitted successfully. Awaiting treasurer verification.',
      payment: savedPayment,
    });
  } catch (error) {
    console.error('Error resubmitting payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resubmit payment',
      error: error.message,
    });
  }
};

/**
 * @desc    Get payment status history for a specific payment
 * @route   GET /api/groupfund/payment-history/:id
 * @access  Private (Member - own payments, Treasurer - all payments)
 */
export const getPaymentHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find payment and populate user details in history
    const payment = await GroupFund.findById(id)
      .populate('statusHistory.changedBy', 'name email role')
      .populate('verifiedBy', 'name email')
      .lean();

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Verify ownership - user can only view their own payment history unless they're treasurer
    if (userRole !== 'treasurer' && payment.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access',
      });
    }

    res.status(200).json({
      success: true,
      history: payment.statusHistory || [],
      currentStatus: payment.status,
      payment: {
        month: payment.month,
        year: payment.year,
        amount: payment.amount,
        deadline: payment.deadline,
      },
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message,
    });
  }
};

/**
 * @desc    Verify resubmitted payment (Treasurer only)
 * @route   POST /api/groupfund/verify-resubmission/:id
 * @access  Private (Treasurer only)
 */
export const verifyResubmittedPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true or false
    const userId = req.user._id;

    // Find the payment record
    const payment = await GroupFund.findById(id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found',
      });
    }

    // Check if there's a resubmission
    if (
      !payment.failedPaymentSubmission ||
      !payment.failedPaymentSubmission.resubmittedPhoto
    ) {
      return res.status(400).json({
        success: false,
        message: 'No resubmission found for this payment',
      });
    }

    if (approve) {
      console.log(`✅ Treasurer ${userId} verifying resubmitted payment ${id}`);
      
      // Approve: Change status from Failed to Paid
      payment.status = 'Paid';
      payment.paymentProof = payment.failedPaymentSubmission.resubmittedPhoto;
      payment.paymentDate = payment.failedPaymentSubmission.resubmittedDate;
      payment.verifiedBy = userId;
      payment.verifiedDate = new Date();

      // Add to status history
      payment.statusHistory.push({
        status: 'Paid',
        changedBy: userId,
        changedDate: new Date(),
        reason: 'Treasurer approved resubmitted payment',
      });
      
      // Save payment FIRST before updating user/wallet to prevent data inconsistency
      await payment.save();
      console.log(`✅ Payment ${id} marked as Paid in DB`);

      // Update user's total paid
      const user = await User.findById(payment.userId);
      if (user) {
        user.totalPaid += payment.amount;
        await user.save();
        console.log(`✅ User ${user.email} totalPaid updated`);
      }
      
      // Note: Wallet update should ideally happen here too if not handled elsewhere
    } else {
      console.log(`❌ Treasurer ${userId} rejecting resubmitted payment ${id}`);
      
      // Reject: Keep as Failed, clear resubmission
      payment.failedPaymentSubmission = {
        resubmittedPhoto: null,
        resubmittedDate: null,
        resubmissionNote: '',
      };
      
      payment.markModified('failedPaymentSubmission');

      payment.statusHistory.push({
        status: 'Failed',
        changedBy: userId,
        changedDate: new Date(),
        reason: 'Treasurer rejected resubmitted payment',
      });
      
      await payment.save();
    }

    res.status(200).json({
      success: true,
      message: approve
        ? 'Payment approved successfully'
        : 'Payment rejected. Member can resubmit again.',
      payment: payment,
    });
  } catch (error) {
    console.error('Error verifying resubmitted payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify resubmitted payment',
      error: error.message,
    });
  }
};
