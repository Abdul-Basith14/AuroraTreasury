import express from 'express';
import {
  signup,
  login,
  getMe,
  verifyToken,
  logout,
  sendOTP,
  verifyOTP,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

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

export default router;
