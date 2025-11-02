import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  type: {
    type: String,
    enum: ['login', 'signup'],
    required: [true, 'Type is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Document will be automatically deleted after 10 minutes
  },
});

// Method to check if OTP is expired (10 minutes)
otpSchema.methods.isExpired = function() {
  const now = new Date();
  const createdAt = this.createdAt;
  const diffInMinutes = Math.floor((now - createdAt) / (1000 * 60));
  return diffInMinutes >= 10;
};

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;