import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate OTP and expiry
    const otp = generateOTP();
    const otpExpiry = Date.now() + 600000; // OTP valid for 10 minutes

    // Save OTP to user
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send email with OTP
    const emailContent = {
      to: user.email,
      subject: 'Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center;">Your Password Reset OTP</h1>
          <p style="color: #666; text-align: center;">You requested to reset your password. Use this OTP to reset your password:</p>
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
            <h2 style="color: #007bff; letter-spacing: 5px; font-size: 32px; margin: 0;">${otp}</h2>
          </div>
          <p style="color: #666; text-align: center;">This OTP will expire in 10 minutes.</p>
          <p style="color: #666; text-align: center;">If you didn't request this OTP, please ignore this email.</p>
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; text-align: center;">This is a secure OTP from Aurora Treasury</p>
          </div>
        </div>
      `
    };

    await sendEmail(emailContent);
    res.status(200).json({ message: 'Password reset OTP sent to your email' });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error processing password reset request' });
  }
};

// Reset password using OTP
export const resetPassword = async (req, res) => {
  try {
    const { otp, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user password and clear OTP
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};