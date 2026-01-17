import mongoose from 'mongoose';

const monthlyGroupFundRecordSchema = new mongoose.Schema({
  month: {
    type: String,
    required: true,
    enum: ['January', 'February', 'March', 'April', 'May', 'June', 
           'July', 'August', 'September', 'October', 'November', 'December']
  },
  year: {
    type: Number,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  amounts: {
    firstYear: {
      type: Number,
      default: 0
    },
    secondYear: {
      type: Number,
      default: 0
    },
    thirdYear: {
      type: Number,
      default: 0
    },
    fourthYear: {
      type: Number,
      default: 0
    }
  },
  includedYears: {
    type: [String],
    required: true,
    enum: ['1st', '2nd', '3rd', '4th']
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one active record per month-year combination
monthlyGroupFundRecordSchema.index({ month: 1, year: 1, status: 1 });

export default mongoose.model('MonthlyGroupFundRecord', monthlyGroupFundRecordSchema);
