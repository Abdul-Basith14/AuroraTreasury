import User from '../models/User.js';
import ClubSettings from '../models/ClubSettings.js';
import { generateToken } from '../middleware/auth.js';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req, res) => {
  try {
    const { name, usn, email, password, confirmPassword, year, branch, role } = req.body;

    // Validation: Check all required fields
    if (!name || !usn || !email || !password || !confirmPassword || !year || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validation: Check password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match',
      });
    }

    // Validation: Check password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Validation: Check if email already exists
    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered. Please use a different email or login.',
      });
    }

    // Validation: Check if USN already exists
    const usnExists = await User.findOne({ usn: usn.toUpperCase() });
    if (usnExists) {
      return res.status(400).json({
        success: false,
        message: 'USN already registered. Please check your USN or contact admin.',
      });
    }

    // Validation: Check valid year
    const validYears = ['1st', '2nd', '3rd', '4th'];
    if (!validYears.includes(year)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid academic year. Please select from 1st to 4th year.',
      });
    }

    // Create new user
    const user = await User.create({
      name: name.trim(),
      usn: usn.toUpperCase().trim(),
      email: email.toLowerCase().trim(),
      password,
      year,
      branch: branch.trim(),
      role: role || 'member', // Default to member if not specified
    });

    // Generate JWT token
    const token = generateToken(user._id);

    // Send response (password is automatically excluded due to toJSON method)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    // Handle duplicate key errors (race condition)
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `${field.toUpperCase()} already exists. Please use a different ${field}.`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration. Please try again.',
    });
  }
};

/**
 * @desc    Login user with email, password, and aurora code
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
  try {
    const { email, password, auroraCode } = req.body;

    // Validation: Check all fields
    if (!email || !password || !auroraCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and aurora code',
      });
    }

    // Verify Aurora Code from ClubSettings
    const clubSettings = await ClubSettings.findOne({ isActive: true });
    
    if (!clubSettings) {
      return res.status(500).json({
        success: false,
        message: 'Club settings not configured. Please contact administrator.',
      });
    }

    if (clubSettings.auroraCode !== auroraCode.toUpperCase().trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Aurora Code. Please check and try again.',
      });
    }

    // Find user by email (include password field for comparison)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact administrator.',
      });
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Remove password from user object before sending response
    user.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login. Please try again.',
    });
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
    });
  }
};

/**
 * @desc    Verify JWT token
 * @route   POST /api/auth/verify
 * @access  Private
 */
export const verifyToken = async (req, res) => {
  try {
    // If we reach here, token is valid (protect middleware verified it)
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    console.error('Verify Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
    });
  }
};

/**
 * @desc    Logout user (client-side token removal)
 * @route   POST /api/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
  try {
    // In JWT authentication, logout is handled on client-side by removing the token
    // This endpoint is mainly for logging purposes
    
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout',
    });
  }
};
