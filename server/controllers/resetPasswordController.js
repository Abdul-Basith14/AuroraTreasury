import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import PasswordResetRequest from '../models/PasswordResetRequest.js';
import { sendPasswordResetRequestEmail } from '../utils/emailService.js';

/**
 * @desc    Request password reset (creates a request for treasurer verification)
 * @route   POST /api/auth/request-reset
 * @access  Public
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validation
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, new password, and confirm password'
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    // Check if there's already a pending request and cancel it (allow unlimited requests)
    const existingRequest = await PasswordResetRequest.findOne({
      user: user._id,
      status: 'pending'
    });

    if (existingRequest) {
      // Cancel the old pending request and create a new one
      existingRequest.status = 'rejected';
      existingRequest.rejectionReason = 'User submitted a new password reset request';
      await existingRequest.save();
    }

    // Hash the new password before storing
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Create password reset request
    const resetRequest = await PasswordResetRequest.create({
      user: user._id,
      newPassword: hashedPassword,
      status: 'pending'
    });

    // Populate user data for email
    await resetRequest.populate('user', 'name email usn');

    // Send notification email to treasurer
    try {
      await sendPasswordResetRequestEmail(resetRequest);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password reset request submitted successfully. Please wait for treasurer verification.'
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request'
    });
  }
};

/**
 * @desc    Check password reset request status
 * @route   GET /api/auth/reset-status/:email
 * @access  Public
 */
export const checkResetStatus = async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const resetRequest = await PasswordResetRequest.findOne({
      user: user._id
    }).sort({ createdAt: -1 });

    if (!resetRequest) {
      return res.status(200).json({
        success: true,
        data: {
          hasRequest: false,
          status: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasRequest: true,
        status: resetRequest.status,
        createdAt: resetRequest.createdAt,
        verifiedAt: resetRequest.verifiedAt,
        rejectionReason: resetRequest.rejectionReason
      }
    });
  } catch (error) {
    console.error('Check reset status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking reset status'
    });
  }
};