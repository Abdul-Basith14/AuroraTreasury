import express from 'express';
import {
  signup,
  login,
  getMe,
  verifyToken,
  logout,
  sendOTP,
  verifyOTP,
  requestPasswordReset,
  resetPassword,
  updateProfile
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfilePhoto, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * Authentication Routes
 */

// @route   POST /api/auth/send-otp
// @desc    Send OTP for email verification
// @access  Public
router.post('/send-otp', sendOTP);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Login user with email, password, and aurora code
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private (requires valid token)
router.get('/me', protect, getMe);

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Private (requires valid token)
router.post('/verify', protect, verifyToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private (requires valid token)
router.post('/logout', protect, logout);

// @route   POST /api/auth/request-reset
// @desc    Request password reset (sends email with reset link)
// @access  Public
router.post('/request-reset', requestPasswordReset);

// @route   POST /api/auth/reset
// @desc    Reset password using token
// @access  Public
router.post('/reset', resetPassword);

// @route   PUT /api/auth/profile
// @desc    Update profile details and photo
// @access  Private
router.put('/profile', protect, uploadProfilePhoto, handleUploadError, updateProfile);

export default router;
