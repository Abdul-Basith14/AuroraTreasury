import mongoose from 'mongoose';

/**
 * GroupFund Schema for Aurora Treasury
 * Tracks monthly group fund payments for each member
 */
const groupFundSchema = new mongoose.Schema(
  {
    // Reference to the user who made the payment
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster queries
    },

    // Academic year for the payment (e.g., "2025-2026")
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },

    // Month name (e.g., "November 2025")
    month: {
      type: String,
      required: [true, 'Month is required'],
    },

    // Month number for sorting (1-12, where 1 = January, 12 = December)
    monthNumber: {
      type: Number,
      required: [true, 'Month number is required'],
      min: [1, 'Month number must be between 1 and 12'],
      max: [12, 'Month number must be between 1 and 12'],
    },

    // Year (e.g., 2025)
    year: {
      type: Number,
      required: [true, 'Year is required'],
      min: [2020, 'Year must be valid'],
    },

    // Payment amount based on student year
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Amount cannot be negative'],
    },

    // Payment status
    status: {
      type: String,
      enum: ['Pending', 'AwaitingVerification', 'Paid', 'Failed'],
      default: 'Pending',
    },

    // Unique payment reference code (e.g., AT-FUND01-U123-20260117)
    paymentReference: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    // Whether member has clicked "I have paid"
    memberConfirmedPayment: {
      type: Boolean,
      default: false,
    },

    // Date when member confirmed payment
    memberConfirmedDate: {
      type: Date,
      default: null,
    },

    // Date when payment was actually made
    paymentDate: {
      type: Date,
      default: null,
    },

    // Reference to treasurer who verified the payment
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Date when payment was verified by treasurer
    verifiedDate: {
      type: Date,
      default: null,
    },

    // Date when member submitted payment proof
    submittedDate: {
      type: Date,
      default: null,
    },

    // Payment deadline date
    deadline: {
      type: Date,
      required: [true, 'Payment deadline is required'],
    },

    // Rejection reason if payment is rejected by treasurer
    rejectionReason: {
      type: String,
      default: '',
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },

    // Payment method - tracks how payment was made
    paymentMethod: {
      type: String,
      enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'],
      default: 'UPI',
    },

    // Status History - tracks all status changes over time
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['Pending', 'AwaitingVerification', 'Paid', 'Failed'],
          required: true,
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        changedDate: {
          type: Date,
          default: Date.now,
        },
        reason: {
          type: String,
          default: '',
          maxlength: [300, 'Reason cannot exceed 300 characters'],
        },
      },
    ],

    // Created timestamp
    createdAt: {
      type: Date,
      default: Date.now,
    },
    
    // Whether this record should be visible to the member's dashboard
    visibleToMember: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

/**
 * Compound index for unique constraint on user + month + year
 * Each user can only have one payment record per month per year
 */
groupFundSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

/**
 * Index for efficient querying by status and deadline
 */
groupFundSchema.index({ status: 1, deadline: 1 });

/**
 * Method to check if payment is overdue
 * @returns {boolean} - True if payment is overdue and status is Pending
 */
groupFundSchema.methods.isOverdue = function () {
  return this.status === 'Pending' && new Date() > this.deadline;
};

/**
 * Method to update status and track change in history
 * @param {string} newStatus - New status value
 * @param {ObjectId} userId - ID of user making the change
 * @param {string} reason - Reason for status change
 */
groupFundSchema.methods.updateStatus = function (newStatus, userId, reason = '') {
  // Add current status to history before updating
  this.statusHistory.push({
    status: this.status,
    changedBy: userId,
    changedDate: new Date(),
    reason: reason,
  });
  
  // Update to new status
  this.status = newStatus;
};

/**
 * Static method to mark overdue payments as Failed
 * Can be called by cron job
 */
groupFundSchema.statics.markOverdueAsFailed = async function () {
  const result = await this.updateMany(
    {
      status: 'Pending',
      deadline: { $lt: new Date() },
      paymentProof: null // Only mark as failed if no proof has been submitted
    },
    {
      $set: { status: 'Failed' },
    }
  );
  return result;
};

/**
 * Static method to get payment summary for a user
 * @param {ObjectId} userId - User ID
 * @returns {Object} - Summary with total paid, pending, and failed counts
 */
groupFundSchema.statics.getUserPaymentSummary = async function (userId) {
  const payments = await this.find({ userId });

  const summary = {
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    paidCount: 0,
    pendingCount: 0,
    failedCount: 0,
  };

  payments.forEach((payment) => {
    if (payment.status === 'Paid') {
      summary.totalPaid += payment.amount;
      summary.paidCount += 1;
    } else if (payment.status === 'Pending') {
      summary.totalPending += payment.amount;
      summary.pendingCount += 1;
    } else if (payment.status === 'Failed') {
      summary.totalFailed += payment.amount;
      summary.failedCount += 1;
    }
  });

  return summary;
};

const GroupFund = mongoose.model('GroupFund', groupFundSchema);

export default GroupFund;
