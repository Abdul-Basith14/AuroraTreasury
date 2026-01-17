import mongoose from 'mongoose';

/**
 * PasswordResetRequest Schema
 * Stores password reset requests that require treasurer verification
 */
const passwordResetRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    newPassword: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    verifiedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
passwordResetRequestSchema.index({ user: 1, status: 1 });
passwordResetRequestSchema.index({ status: 1, createdAt: -1 });

const PasswordResetRequest = mongoose.model('PasswordResetRequest', passwordResetRequestSchema);

export default PasswordResetRequest;
