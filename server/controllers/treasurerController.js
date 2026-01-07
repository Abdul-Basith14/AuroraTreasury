import User from '../models/User.js';
import GroupFund from '../models/GroupFund.js';
import Wallet from '../models/Wallet.js';

/**
 * @desc    Get all members with payment statistics
 * @route   GET /api/treasurer/members
 * @access  Private (Treasurer only)
 */
export const getMembers = async (req, res) => {
  try {
    const { year, status, search } = req.query;

    // Build user filter
    let userFilter = { role: 'member' };
    if (year && year !== 'all') {
      userFilter.year = year;
    }
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { usn: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Get all members
    const members = await User.find(userFilter)
      .select('name usn email year branch totalPaid profilePhoto')
      .sort({ year: 1, name: 1 });

    // Get payment data for each member
    const membersWithPayments = await Promise.all(
      members.map(async (member) => {
        let paymentFilter = { userId: member._id };
        
        // Apply status filter if needed
        if (status && status !== 'all') {
          if (status === 'paid') {
            paymentFilter.status = 'Paid';
          } else if (status === 'pending') {
            paymentFilter.status = 'Pending';
          } else if (status === 'failed') {
            paymentFilter.status = 'Failed';
          }
        }

        const payments = await GroupFund.find(paymentFilter);
        
        const totalDue = payments.reduce((sum, p) => sum + p.amount, 0);
        const totalPaid = payments
          .filter(p => p.status === 'Paid')
          .reduce((sum, p) => sum + p.amount, 0);
        const pending = payments
          .filter(p => p.status === 'Pending')
          .reduce((sum, p) => sum + p.amount, 0);
        const failed = payments
          .filter(p => p.status === 'Failed')
          .reduce((sum, p) => sum + p.amount, 0);

        return {
          _id: member._id,
          name: member.name,
          usn: member.usn,
          email: member.email,
          year: member.year,
          branch: member.branch,
          profilePhoto: member.profilePhoto,
          totalDue,
          totalPaid,
          pending,
          failed,
          paymentStatus: totalPaid === totalDue && totalDue > 0 ? 'paid' : 
                        pending > 0 ? 'pending' : 
                        failed > 0 ? 'failed' : 'none'
        };
      })
    );

    res.status(200).json({
      success: true,
      count: membersWithPayments.length,
      members: membersWithPayments
    });
  } catch (error) {
    console.error('Error in getMembers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch members',
      error: error.message
    });
  }
};

/**
 * @desc    Get all payments for a specific member
 * @route   GET /api/treasurer/member/:userId/payments
 * @access  Private (Treasurer only)
 */
export const getMemberPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Member not found'
      });
    }

    const payments = await GroupFund.find({ userId })
      .sort({ month: 1 });

    res.status(200).json({
      success: true,
      member: user,
      payments
    });
  } catch (error) {
    console.error('Error in getMemberPayments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch member payments',
      error: error.message
    });
  }
};

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/treasurer/statistics
 * @access  Private (Treasurer only)
 */
export const getStatistics = async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    
    const allPayments = await GroupFund.find({});
    
    const totalCollection = allPayments
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const pendingPayments = allPayments
      .filter(p => p.status === 'Pending')
      .length;
    
    const failedPayments = allPayments
      .filter(p => p.status === 'Failed')
      .length;
    
    const pendingResubmissions = allPayments
      .filter(p => p.status === 'Failed' && p.failedPaymentSubmission?.resubmittedPhoto)
      .length;

    // Get wallet balance
    const wallet = await Wallet.findOne();
    const walletBalance = wallet ? wallet.balance : 0;

    res.status(200).json({
      success: true,
      overall: {
        totalMembers,
        totalCollection,
        pendingPayments,
        failedPayments,
        pendingResubmissions,
        walletBalance
      }
    });
  } catch (error) {
    console.error('Error in getStatistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

/**
 * @desc    Get summary of failed payments grouped by month
 * @route   GET /api/treasurer/failed-payments-summary
 * @access  Private (Treasurer only)
 */
export const getFailedPaymentsSummary = async (req, res) => {
  try {
    const failedPayments = await GroupFund.find({ status: 'Failed' })
      .populate('userId', 'name usn email year branch')
      .sort({ month: 1 });

    // Group by month
    const groupedByMonth = failedPayments.reduce((acc, payment) => {
      const month = payment.month;
      if (!acc[month]) {
        acc[month] = {
          month,
          payments: [],
          totalAmount: 0,
          count: 0
        };
      }
      acc[month].payments.push(payment);
      acc[month].totalAmount += payment.amount;
      acc[month].count += 1;
      return acc;
    }, {});

    const summary = Object.values(groupedByMonth);

    res.status(200).json({
      success: true,
      summary
    });
  } catch (error) {
    console.error('Error in getFailedPaymentsSummary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch failed payments summary',
      error: error.message
    });
  }
};

/**
 * @desc    Get month-based member list with payment status
 * @route   GET /api/treasurer/member-list/:month/:year
 * @access  Private (Treasurer only)
 */
export const getMonthBasedMemberList = async (req, res) => {
  try {
    const { month, year } = req.params;

    console.log(`📋 Fetching member list for ${month} ${year}`);

    // Get ALL members first
    const allMembers = await User.find({ role: 'member' })
      .select('name usn email year branch profilePhoto')
      .sort({ year: 1, name: 1 });

    console.log(`📋 Found ${allMembers.length} total members in club`);

    // Get all payment records for this month
    const payments = await GroupFund.find({
      month,
      year: parseInt(year)
    })
      .populate('userId', 'name usn email year branch profilePhoto')
      .populate('verifiedBy', 'name');

    console.log(`📋 Found ${payments.length} payment records for ${month} ${year}`);

    // Create a map of userId to payment
    const paymentMap = {};
    payments.forEach(payment => {
      if (payment.userId && payment.userId._id) {
        paymentMap[payment.userId._id.toString()] = payment;
      }
    });

    // Combine members with their payment status
    const membersList = allMembers.map(member => {
      const payment = paymentMap[member._id.toString()];
      
      if (payment) {
        // Member has a payment record for this month
        // Use the member object from allMembers (not the populated one from payment)
        // Determine status for treasurer view: if the official status is Paid
        // OR the treasurer has marked it as paid in the members list, show as Paid
        const treasurerStatus = (payment.status === 'Paid' || payment.treasurerMarkedPaid) ? 'Paid' : payment.status;
        const treasurerPaymentDate = payment.paymentDate || payment.treasurerMarkedDate || null;

        return {
          _id: payment._id,
          userId: {
            _id: member._id,
            name: member.name,
            usn: member.usn,
            email: member.email,
            year: member.year,
            branch: member.branch,
            profilePhoto: member.profilePhoto
          },
          month: payment.month,
          year: payment.year,
          amount: payment.amount,
          status: treasurerStatus,
          origStatus: payment.status,
          treasurerMarkedPaid: payment.treasurerMarkedPaid || false,
          paymentDate: treasurerPaymentDate,
          paymentMethod: payment.paymentMethod,
          verifiedBy: payment.verifiedBy
        };
      } else {
        // Member doesn't have a payment record for this month
        return {
          _id: null,
          userId: {
            _id: member._id,
            name: member.name,
            usn: member.usn,
            email: member.email,
            year: member.year,
            branch: member.branch,
            profilePhoto: member.profilePhoto
          },
          month: month,
          year: parseInt(year),
          amount: 0,
          status: 'Not Created',
          paymentDate: null,
          paymentMethod: null,
          verifiedBy: null
        };
      }
    });

    // Calculate summary
    const summary = {
      totalMembers: membersList.length,
      paidCount: membersList.filter(m => m.status === 'Paid').length,
      pendingCount: membersList.filter(m => m.status === 'Pending').length,
      failedCount: membersList.filter(m => m.status === 'Failed').length,
      notCreatedCount: membersList.filter(m => m.status === 'Not Created').length,
      // totalCollected should count only officially paid records (origStatus === 'Paid')
      totalCollected: membersList
        .filter(m => m.origStatus === 'Paid')
        .reduce((sum, m) => sum + m.amount, 0)
    };

    console.log(`📋 Summary:`, summary);

    res.status(200).json({
      success: true,
      month,
      year,
      members: membersList,
      summary
    });
  } catch (error) {
    console.error('Error in getMonthBasedMemberList:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch month-based member list',
      error: error.message
    });
  }
};

/**
 * @desc    Create monthly payment records for all members with year-wise amounts
 * @route   POST /api/treasurer/create-monthly-records
 * @access  Private (Treasurer only)
 * @body    { 
 *   month: string, 
 *   year: number, 
 *   yearAmounts: Array<{year: number, amount: number}>, 
 *   deadline: Date 
 * }
 */
export const createMonthlyRecordsForAll = async (req, res) => {
  try {
    const { month, year, yearAmounts, deadline } = req.body;

    // Validate input
    if (!month || !year || !yearAmounts || !Array.isArray(yearAmounts) || yearAmounts.length === 0 || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, yearAmounts array, and deadline are required'
      });
    }

    // Convert yearAmounts to a map for easier lookup
    const amountByYear = {};
    for (const item of yearAmounts) {
      if (typeof item.year === 'number' && typeof item.amount === 'number' && item.amount > 0) {
        amountByYear[item.year] = item.amount;
      }
    }

    // Check if we have amounts for all required years
    if (Object.keys(amountByYear).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one valid year amount is required'
      });
    }

    console.log(`🆕 Creating monthly records for ${month} ${year} with year-wise amounts`);

    // Get all members
    const allMembers = await User.find({ role: 'member' });
    console.log(`👥 Found ${allMembers.length} members`);

    // Check if records already exist for this month
    const existingRecords = await GroupFund.find({
      month,
      year: parseInt(year)
    });

    if (existingRecords.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Payment records already exist for ${month} ${year}. Found ${existingRecords.length} records.`
      });
    }

    // Create payment records for all members
    const monthNumber = new Date(`${month} 1, ${year}`).getMonth() + 1;
    
    // Generate academic year format (YYYY-YYYY)
    // For months Aug-Dec, academic year is current year to next year
    // For months Jan-Jul, academic year is previous year to current year
    const academicYearStart = monthNumber >= 8 ? parseInt(year) : parseInt(year) - 1;
    const academicYearEnd = academicYearStart + 1;
    const academicYearString = `${academicYearStart}-${academicYearEnd}`;
    
    const paymentRecords = allMembers.map(member => {
      // member.year is stored as strings like '1st', '2nd', etc.
      // Convert to numeric year key to match amountByYear keys (1,2,3,4)
      const memberYearNumber = parseInt(member.year) || 1;
      const amount = (typeof amountByYear[memberYearNumber] === 'number')
        ? amountByYear[memberYearNumber]
        : amountByYear[1]; // Default to first year if no valid match

      return {
        userId: member._id,
        month: month,
        monthNumber: monthNumber,
        year: parseInt(year),
        academicYear: academicYearString,
        amount: parseFloat(amount),
        deadline: new Date(deadline),
        // Do not expose newly created records to members until the treasurer
        // explicitly publishes them. This avoids updating member dashboards
        // when records are prepared by the treasurer.
        visibleToMember: false,
        status: 'Pending',
        paymentProof: null,
        submittedDate: null,
        paymentDate: null,
        verifiedBy: null,
        verifiedDate: null,
        statusHistory: [{
          status: 'Pending',
          changedBy: req.user._id,
          changedDate: new Date(),
          reason: `Monthly record created by treasurer for ${month} ${year} (Year ${memberYearNumber} amount: ₹${amount})`
        }]
      };
    });

    // Insert all records
    const createdRecords = await GroupFund.insertMany(paymentRecords);

    console.log(`✅ Created ${createdRecords.length} payment records`);

    res.status(201).json({
      success: true,
      message: `Successfully created ${createdRecords.length} payment records for ${month} ${year}`,
      count: createdRecords.length,
      records: createdRecords
    });
  } catch (error) {
    console.error('Error in createMonthlyRecordsForAll:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create monthly records',
      error: error.message
    });
  }
};

/**
 * @desc    Delete all payment records for a specific month
 * @route   DELETE /api/treasurer/delete-monthly-records/:month/:year
 * @access  Private (Treasurer only)
 */
export const deleteMonthlyRecords = async (req, res) => {
  try {
    const { month, year } = req.params;

    const result = await GroupFund.deleteMany({
      month,
      year: parseInt(year)
    });

    res.status(200).json({
      success: true,
      message: `Deleted ${result.deletedCount} payment records for ${month} ${year}`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error in deleteMonthlyRecords:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete monthly records',
      error: error.message
    });
  }
};

/**
 * @desc    Get wallet balance and transaction history
 * @route   GET /api/treasurer/wallet
 * @access  Private (Treasurer only)
 */
export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne();
    
    if (!wallet) {
      wallet = await Wallet.create({
        balance: 0,
        transactions: []
      });
    }

    res.status(200).json({
      success: true,
      wallet
    });
  } catch (error) {
    console.error('Error in getWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch wallet',
      error: error.message
    });
  }
};

/**
 * @desc    Add money to wallet
 * @route   POST /api/treasurer/wallet/add
 * @access  Private (Treasurer only)
 */
export const addMoneyToWallet = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    // Use Wallet static helper to retrieve or create the wallet
    const wallet = await Wallet.getWallet();

    // Ensure amount is a number
    const amt = parseFloat(amount);

    // Use model method to add money (ensures transaction fields and validation)
    await wallet.addMoney(amt, description || 'Money added to wallet', req.user._id);

    res.status(200).json({
      success: true,
      message: 'Money added successfully',
      wallet: await Wallet.getWallet()
    });
  } catch (error) {
    console.error('Error in addMoneyToWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add money',
      error: error.message
    });
  }
};

/**
 * @desc    Remove money from wallet
 * @route   POST /api/treasurer/wallet/remove
 * @access  Private (Treasurer only)
 */
export const removeMoneyFromWallet = async (req, res) => {
  try {
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount is required'
      });
    }
    // Use Wallet helper
    const wallet = await Wallet.getWallet();
    const amt = parseFloat(amount);

    // Use model method to remove money (will throw if insufficient)
    await wallet.removeMoney(amt, description || 'Money removed from wallet', req.user._id);

    res.status(200).json({
      success: true,
      message: 'Money removed successfully',
      wallet: await Wallet.getWallet()
    });
  } catch (error) {
    console.error('Error in removeMoneyFromWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove money',
      error: error.message
    });
  }
};

/**
 * @desc    Get payment requests (pending)
 * @route   GET /api/treasurer/payment-requests
 * @access  Private (Treasurer only)
 */
export const getPaymentRequests = async (req, res) => {
  try {
    const { status = 'Pending', month, year } = req.query;

    let query = {};

    if (status !== 'all') {
      query.status = status;
    }

    if (month) {
      query.month = month;
    }

    const requests = await GroupFund.find(query)
      .populate('userId', 'name usn email year branch profilePhoto mobileNumber')
      .sort({ submittedDate: 1 });

    console.log(`📊 Found ${requests.length} requests with status: ${status}`);
    
    let filteredRequests = requests;
    if (year && year !== 'all') {
      filteredRequests = requests.filter(r => r.userId && r.userId.year === year);
    }

    // Filter for requests with payment proof
    filteredRequests = filteredRequests.filter(r => r.paymentProof);
    
    console.log(`✅ After filtering: ${filteredRequests.length} requests with payment proof`);

    res.status(200).json({
      success: true,
      count: filteredRequests.length,
      requests: filteredRequests
    });
  } catch (error) {
    console.error('Error in getPaymentRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment requests',
      error: error.message
    });
  }
};

/**
 * @desc    Verify and approve a payment request
 * @route   POST /api/treasurer/verify-payment/:paymentId
 * @access  Private (Treasurer only)
 */
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment without populating first
    const payment = await GroupFund.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }
    
    if (payment.status === 'Paid') {
      return res.status(400).json({
        success: false,
        message: 'Payment already verified'
      });
    }
    
    if (!payment.paymentProof) {
      return res.status(400).json({
        success: false,
        message: 'No payment proof found'
      });
    }
    
    // Get user details before updating payment
    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Accept the payment: mark as Paid, record verifier, and add to totals/wallet.
    console.log(`✅ Verifying and accepting payment ${paymentId} - marking as Paid`);
    payment.proofVerified = true;
    payment.proofVerifiedBy = req.user._id;
    payment.proofVerifiedDate = new Date();

    // Update payment to Paid
    payment.status = 'Paid';
    payment.paymentDate = payment.paymentDate || new Date();
    payment.verifiedBy = req.user._id;
    payment.verifiedDate = new Date();

    payment.statusHistory.push({
      status: 'Paid',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Payment verified and accepted by treasurer'
    });

    // Save payment
    await payment.save();
    console.log(`✅ Payment ${paymentId} marked as Paid`);

    // Update user's total paid
    user.totalPaid += payment.amount;
    await user.save();

    // Update wallet balance
    const wallet = await Wallet.getWallet();
    await wallet.addMoney(
      payment.amount,
      `Payment from ${user.name} (${user.usn}) for ${payment.month} ${payment.year} - accepted by treasurer`,
      req.user._id
    );

    // Populate userId for response
    await payment.populate('userId');

    res.status(200).json({
      success: true,
      message: 'Payment verified and accepted successfully',
      payment: payment
    });
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify payment',
      error: error.message
    });
  }
};

/**
 * @desc    Reject a payment request
 * @route   POST /api/treasurer/reject-payment/:paymentId
 * @access  Private (Treasurer only)
 */
export const rejectPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const payment = await GroupFund.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment request not found'
      });
    }
    
    payment.status = 'Failed';
    payment.rejectionReason = reason;
    
    payment.statusHistory.push({
      status: 'Failed',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: `Payment rejected by treasurer: ${reason}` 
    });
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment rejected',
      payment: payment
    });
  } catch (error) {
    console.error('Error in rejectPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get resubmission requests
 * @route   GET /api/treasurer/resubmission-requests
 * @access  Private (Treasurer only)
 */
export const getResubmissionRequests = async (req, res) => {
  try {
    const requests = await GroupFund.find({
      status: 'Failed',
      'failedPaymentSubmission.resubmittedPhoto': { $exists: true, $ne: null }
    })
      .populate('userId', 'name usn email year branch profilePhoto mobileNumber')
      .sort({ 'failedPaymentSubmission.resubmittedDate': 1 });
    
    res.status(200).json({
      success: true,
      count: requests.length,
      requests: requests
    });
  } catch (error) {
    console.error('Error in getResubmissionRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resubmission requests',
      error: error.message
    });
  }
};

/**
 * @desc    Verify resubmitted payment
 * @route   POST /api/treasurer/verify-resubmission/:paymentId
 * @access  Private (Treasurer only)
 */
export const verifyResubmission = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Find payment without populating first
    const payment = await GroupFund.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    if (!payment.failedPaymentSubmission || !payment.failedPaymentSubmission.resubmittedPhoto) {
      return res.status(400).json({
        success: false,
        message: 'No resubmission found'
      });
    }
    
    // Get user details before updating payment
    const user = await User.findById(payment.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update payment status
    console.log(`🔄 Updating resubmitted payment ${paymentId} status from ${payment.status} to Paid`);
    payment.status = 'Paid';
    payment.paymentProof = payment.failedPaymentSubmission.resubmittedPhoto;
    payment.paymentDate = payment.failedPaymentSubmission.resubmittedDate;
    payment.verifiedBy = req.user._id;
    payment.verifiedDate = new Date();
    
    payment.statusHistory.push({
      status: 'Paid',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Resubmitted payment verified by treasurer'
    });
    
    // Save payment first to ensure status is persisted
    await payment.save();
    console.log(`✅ Resubmitted payment ${paymentId} status successfully updated to ${payment.status}`);
    
    // Update user's total paid
    user.totalPaid += payment.amount;
    await user.save();
    
    // Update wallet balance
    const wallet = await Wallet.getWallet();
    await wallet.addMoney(
      payment.amount,
      `Resubmitted payment from ${user.name} (${user.usn}) for ${payment.month} ${payment.year}`,
      req.user._id
    );
    
    // Populate userId for response
    await payment.populate('userId');
    
    res.status(200).json({
      success: true,
      message: 'Resubmitted payment verified successfully',
      payment: payment
    });
  } catch (error) {
    console.error('Error in verifyResubmission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify resubmission',
      error: error.message
    });
  }
};

/**
 * @desc    Reject resubmitted payment
 * @route   POST /api/treasurer/reject-resubmission/:paymentId
 * @access  Private (Treasurer only)
 */
export const rejectResubmission = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;
    
    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }
    
    const payment = await GroupFund.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    payment.failedPaymentSubmission = null;
    payment.rejectionReason = reason;
    
    payment.statusHistory.push({
      status: 'Failed',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: `Resubmission rejected by treasurer: ${reason}` 
    });
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Resubmission rejected',
      payment: payment
    });
  } catch (error) {
    console.error('Error in rejectResubmission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject resubmission',
      error: error.message
    });
  }
};

/**
 * @desc    Create manual payment for member (treasurer-initiated)
 * @route   POST /api/treasurer/create-manual-payment
 * @access  Private (Treasurer only)
 * @purpose For recording cash/offline payments without member submission
 */
export const createManualPayment = async (req, res) => {
  try {
    const { userId, month, year, amount, paymentMethod, note } = req.body;
    
    // Validate required fields
    if (!userId || !month || !year || !amount) {
      return res.status(400).json({
        success: false,
        message: 'User ID, month, year, and amount are required'
      });
    }
    
    const validMethods = ['Cash', 'Bank Transfer', 'Other'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (Cash, Bank Transfer, or Other)'
      });
    }
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if payment already exists for this month/year
    const existingPayment = await GroupFund.findOne({
      userId,
      month,
      year: parseInt(year)
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: `Payment record already exists for ${month} ${year}. Use update instead.`
      });
    }
    
    // Create new payment record
    const payment = await GroupFund.create({
      userId,
      month,
      year: parseInt(year),
      amount: parseFloat(amount),
      status: 'Paid',
      paymentMethod,
      paymentDate: new Date(),
      verifiedBy: req.user._id,
      verifiedDate: new Date(),
      submittedDate: new Date(),
      statusHistory: [{
        status: 'Paid',
        changedBy: req.user._id,
        changedDate: new Date(),
        reason: note 
          ? `Manually created and marked as paid by treasurer (${paymentMethod}): ${note}` 
          : `Manually created and marked as paid by treasurer (${paymentMethod})`
      }]
    });
    
    // Update user's total paid
    user.totalPaid += payment.amount;
    await user.save();
    
    // Update wallet balance
    const wallet = await Wallet.getWallet();
    await wallet.addMoney(
      payment.amount,
      `Manual payment from ${user.name} (${user.usn}) for ${payment.month} ${payment.year} - ${paymentMethod}`,
      req.user._id
    );
    
    res.status(201).json({
      success: true,
      message: 'Manual payment created and marked as paid successfully',
      payment: await payment.populate('userId', 'name usn email year branch')
    });
  } catch (error) {
    console.error('Error in createManualPayment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create manual payment',
      error: error.message
    });
  }
};

/**
 * @desc    Manually update payment status from Pending to Paid
 * @route   POST /api/treasurer/manual-payment-update/:paymentId
 * @access  Private (Treasurer only)
 * @purpose For cash payments or offline payments without online proof
 */
export const manualPaymentUpdate = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { paymentMethod, note } = req.body;
    
    // Validate payment method
    const validMethods = ['Cash', 'Bank Transfer', 'Other'];
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: 'Valid payment method is required (Cash, Bank Transfer, or Other)'
      });
    }
    
    // Find payment and populate user details
    const payment = await GroupFund.findById(paymentId).populate('userId');
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Check if status is Pending
    if (payment.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Can only mark Pending payments in the treasurer list. Current status: ${payment.status}` 
      });
    }

    // Instead of changing the canonical payment.status (which is shown to members
    // and used for collection totals), mark this payment as "treasurerMarkedPaid".
    // This allows the treasurer UI to show it as Paid while leaving the official
    // status and user-facing history untouched.
    payment.treasurerMarkedPaid = true;
    payment.treasurerMarkedBy = req.user._id;
    payment.treasurerMarkedDate = new Date();

    // Add to status history (note that we're not changing the official status)
    const historyNote = note 
      ? `Treasurer marked as paid (internal only) (${paymentMethod}): ${note}` 
      : `Treasurer marked as paid (internal only) (${paymentMethod})`;

    payment.statusHistory.push({
      status: payment.status, // keep the recorded status in history
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: historyNote
    });

    // Optionally record the payment method used by treasurer (doesn't affect member view)
    payment.paymentMethod = payment.paymentMethod || paymentMethod;

    // Save payment
    await payment.save();
    console.log(`Manual payment update completed for ${payment._id} — treasurerMarkedPaid set. No wallet/user total updates performed.`);
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      payment: payment
    });
  } catch (error) {
    console.error('Error in manualPaymentUpdate:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};
