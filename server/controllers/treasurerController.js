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

    const members = await User.find({ role: 'member' })
      .select('name usn email year branch profilePhoto')
      .sort({ year: 1, name: 1 });

    const memberList = await Promise.all(
      members.map(async (member) => {
        const payment = await GroupFund.findOne({
          userId: member._id,
          month,
          year: parseInt(year)
        });

        let paymentStatus;
        if (payment) {
          // Payment exists, use its status
          paymentStatus = payment.status;
        } else {
          // No payment record - check if deadline has passed
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const monthIndex = monthNames.indexOf(month);
          
          // Assume deadline is 5th of each month (can be made dynamic)
          const deadline = new Date(parseInt(year), monthIndex, 5, 23, 59, 59);
          const now = new Date();
          
          if (now > deadline) {
            paymentStatus = 'Failed'; // Deadline passed, no payment
          } else {
            paymentStatus = 'Pending'; // Deadline not passed yet
          }
        }

        return {
          ...member.toObject(),
          paymentStatus,
          amount: payment ? payment.amount : 0,
          paymentDate: payment ? payment.paymentDate : null,
          paymentId: payment ? payment._id : null
        };
      })
    );

    // Calculate summary
    const summary = {
      totalMembers: memberList.length,
      paidCount: memberList.filter(m => m.paymentStatus === 'Paid').length,
      pendingCount: memberList.filter(m => m.paymentStatus === 'Pending').length,
      failedCount: memberList.filter(m => m.paymentStatus === 'Failed').length,
      totalCollected: memberList
        .filter(m => m.paymentStatus === 'Paid')
        .reduce((sum, m) => sum + m.amount, 0)
    };

    res.status(200).json({
      success: true,
      month,
      year,
      members: memberList,
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

    let wallet = await Wallet.findOne();
    
    if (!wallet) {
      wallet = await Wallet.create({
        balance: 0,
        transactions: []
      });
    }

    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: description || 'Money added to wallet',
      date: new Date(),
      performedBy: req.user._id
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Money added successfully',
      wallet
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

    let wallet = await Wallet.findOne();
    
    if (!wallet) {
      return res.status(400).json({
        success: false,
        message: 'Wallet not found'
      });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    wallet.balance -= amount;
    wallet.transactions.push({
      type: 'debit',
      amount,
      description: description || 'Money removed from wallet',
      date: new Date(),
      performedBy: req.user._id
    });

    await wallet.save();

    res.status(200).json({
      success: true,
      message: 'Money removed successfully',
      wallet
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
    
    const payment = await GroupFund.findById(paymentId).populate('userId');
    
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
    
    payment.status = 'Paid';
    payment.verifiedBy = req.user._id;
    payment.verifiedDate = new Date();
    payment.paymentDate = new Date();
    
    payment.statusHistory.push({
      status: 'Paid',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Payment verified by treasurer'
    });
    
    await payment.save();
    
    // Update user's total paid
    const user = await User.findById(payment.userId._id);
    user.totalPaid += payment.amount;
    await user.save();
    
    // Update wallet balance
    const wallet = await Wallet.getWallet();
    await wallet.addMoney(
      payment.amount,
      `Payment from ${user.name} (${user.usn}) for ${payment.month} ${payment.year}`,
      req.user._id
    );
    
    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
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
    
    const payment = await GroupFund.findById(paymentId).populate('userId');
    
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
    
    payment.status = 'Paid';
    payment.paymentProofPhoto = payment.failedPaymentSubmission.resubmittedPhoto;
    payment.paymentDate = payment.failedPaymentSubmission.resubmittedDate;
    payment.verifiedBy = req.user._id;
    payment.verifiedDate = new Date();
    
    payment.statusHistory.push({
      status: 'Paid',
      changedBy: req.user._id,
      changedDate: new Date(),
      reason: 'Resubmitted payment verified by treasurer'
    });
    
    await payment.save();
    
    const user = await User.findById(payment.userId._id);
    user.totalPaid += payment.amount;
    await user.save();
    
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
