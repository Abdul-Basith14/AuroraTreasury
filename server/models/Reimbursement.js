import mongoose from 'mongoose';

/**
 * Reimbursement Schema for Aurora Treasury
 * Handles member requests for reimbursement of club-related purchases
 * 
 * Status Flow:
 * Pending → Approved → Paid → Received
 * Pending → Rejected
 */
const reimbursementSchema = new mongoose.Schema(
  {
    // Reference to the user who requested reimbursement
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Index for faster queries
    },

    // Member Details
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    year: {
      type: String,
      required: [true, 'Academic year is required'],
      enum: ['1st Year', '2nd Year', '3rd Year', '4th Year'],
    },

    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      match: [/^[6-9]\d{9}$/, 'Please provide a valid 10-digit Indian mobile number'],
    },

    // Request Details
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },

    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
      max: [100000, 'Amount cannot exceed ₹1,00,000'],
    },

    // Bill/Payment Proof (uploaded by member)
    billProofPhoto: {
      type: String,
      required: [true, 'Bill proof photo is required'],
    },

    // Request Status
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Paid', 'Rejected', 'Received'],
      default: 'Pending',
      index: true, // Index for filtering by status
    },

    // Request Date
    requestDate: {
      type: Date,
      default: Date.now,
      index: true, // Index for sorting
    },

    // Treasurer Response
    treasurerResponse: {
      message: {
        type: String,
        trim: true,
        maxlength: [500, 'Response message cannot exceed 500 characters'],
      },
      paymentProofPhoto: {
        type: String, // Cloudinary URL of treasurer's payment screenshot
      },
      respondedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      respondedDate: {
        type: Date,
      },
    },

    // Receipt Confirmation Date (when member confirms they received payment)
    receivedDate: {
      type: Date,
    },

    // Rejection Reason (if rejected by treasurer)
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Indexes for better query performance
 */
reimbursementSchema.index({ userId: 1, createdAt: -1 }); // Composite index for user's requests sorted by date
reimbursementSchema.index({ status: 1, createdAt: -1 }); // For filtering by status

/**
 * Virtual property to check if request can be deleted
 * Only Pending or Rejected requests can be deleted
 */
reimbursementSchema.virtual('canBeDeleted').get(function () {
  return this.status === 'Pending' || this.status === 'Rejected';
});

/**
 * Virtual property to check if receipt can be confirmed
 * Only Paid requests can be confirmed
 */
reimbursementSchema.virtual('canConfirmReceipt').get(function () {
  return this.status === 'Paid';
});

/**
 * Method to confirm receipt of payment
 */
reimbursementSchema.methods.confirmReceipt = function () {
  if (this.status !== 'Paid') {
    throw new Error('Can only confirm receipt for Paid reimbursements');
  }
  this.status = 'Received';
  this.receivedDate = new Date();
  return this.save();
};

/**
 * Method to generate response object (with computed fields)
 */
reimbursementSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  delete obj.__v;
  return obj;
};

/**
 * Pre-save middleware to validate status transitions
 */
reimbursementSchema.pre('save', function (next) {
  // If status is changing to 'Received', ensure receivedDate is set
  if (this.isModified('status') && this.status === 'Received' && !this.receivedDate) {
    this.receivedDate = new Date();
  }
  
  // If status is 'Rejected', ensure rejectionReason is provided
  if (this.isModified('status') && this.status === 'Rejected' && !this.rejectionReason) {
    return next(new Error('Rejection reason is required when rejecting a reimbursement'));
  }
  
  next();
});

const Reimbursement = mongoose.model('Reimbursement', reimbursementSchema);

export default Reimbursement;
