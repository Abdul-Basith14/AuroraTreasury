import mongoose from 'mongoose';

/**
 * ClubSettings Schema
 * Stores club-wide configuration like aurora code, academic year details, and fund amounts
 */
const clubSettingsSchema = new mongoose.Schema(
  {
    auroraCode: {
      type: String,
      required: [true, 'Aurora code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [4, 'Aurora code must be at least 4 characters'],
      maxlength: [20, 'Aurora code cannot exceed 20 characters'],
    },
    academicYear: {
      type: String,
      required: [true, 'Academic year is required'],
      // Format: "2024-2025"
      match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY'],
    },
    monthlyFundAmount: {
      type: Number,
      required: [true, 'Monthly fund amount is required'],
      min: [0, 'Monthly fund amount cannot be negative'],
      default: 100,
    },
    paymentDeadline: {
      type: Number,
      default: 10, // Default deadline is 10th of each month
      min: [1, 'Payment deadline must be between 1 and 31'],
      max: [31, 'Payment deadline must be between 1 and 31'],
    },
    clubName: {
      type: String,
      default: 'Aurora Theatrical Club',
    },
    clubDescription: {
      type: String,
      default: 'A theatrical club dedicated to promoting performing arts',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Ensure only one active settings document exists
 */
clubSettingsSchema.pre('save', async function (next) {
  if (this.isNew) {
    const existingSettings = await mongoose.models.ClubSettings.findOne({ isActive: true });
    if (existingSettings) {
      const error = new Error('Active club settings already exist. Please update existing settings.');
      return next(error);
    }
  }
  next();
});

const ClubSettings = mongoose.model('ClubSettings', clubSettingsSchema);

export default ClubSettings;
