import express from 'express';
import {
  signup,
  login,
  getMe,
  verifyToken,
  logout,
  updateProfile
} from '../controllers/authController.js';
import {
  requestPasswordReset,
  checkResetStatus
} from '../controllers/resetPasswordController.js';
import { protect } from '../middleware/auth.js';
import { uploadProfilePhoto, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

/**
 * Authentication Routes
 */

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
// @desc    Request password reset (creates request for treasurer verification)
// @access  Public
router.post('/request-reset', requestPasswordReset);

// @route   GET /api/auth/reset-status/:email
// @desc    Check password reset request status
// @access  Public
router.get('/reset-status/:email', checkResetStatus);

// @route   PUT /api/auth/profile
// @desc    Update profile details and photo
// @access  Private
router.put('/profile', protect, uploadProfilePhoto, handleUploadError, updateProfile);

export default router;
