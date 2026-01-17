import User from '../models/User.js';
import ClubSettings from '../models/ClubSettings.js';
import { generateToken } from '../middleware/auth.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail } from '../utils/emailService.js';

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
    const { email, password, treasurerKey, auroraCode } = req.body;

    // DEV: log incoming login requests for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('Login request body:', JSON.stringify(req.body));
    }

    // Validation: Check required fields and return which ones are missing
    const missing = [];
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Please provide ${missing.join(' and ')}`,
        missingFields: missing,
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

    // If the user is a treasurer, require the treasurerKey to access treasurer features
    if (user.role === 'treasurer') {
      // For this deployment, the treasurer key is fixed to 'ADARSH'
      const expectedKey = 'ADARSH';

      if (!treasurerKey || treasurerKey.trim().toUpperCase() !== expectedKey) {
        return res.status(401).json({
          success: false,
          message: `Treasurer key is required and must be '${expectedKey}' to login as treasurer.`,
        });
      }
    }

    // Verify password
    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Generate OTP for 2FA
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // Save OTP to database with type 'login'
      await OTP.create({
        email: email.toLowerCase(),
        otp,
        type: 'login',
      });

      // Send OTP via email
      await sendOTPEmail(email, otp);

      // Send success response indicating OTP is required
      res.status(200).json({
        success: true,
        requireOTP: true,
        message: 'Please check your email for OTP',
      });
    } catch (error) {
      console.error('OTP Error:', error);
      res.status(500).json({
        success: false,
        message: 'Error sending OTP. Please try again.',
      });
    }
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

/**
 * @desc    Send OTP for verification
 * @route   POST /api/auth/send-otp
 * @access  Public
 */
export const sendOTP = async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and type (login/signup)',
      });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save OTP to database
    await OTP.create({
      email: email.toLowerCase(),
      otp,
      type,
    });

    // Send OTP via email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending OTP',
    });
  }
};

/**
 * @desc    Verify OTP
 * @route   POST /api/auth/verify-otp
 * @access  Public
 */
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp, type } = req.body;

    if (!email || !otp || !type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and type',
      });
    }

    // Find the latest OTP record for this email and type
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      type,
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // If type is login, get user and generate token
    if (type === 'login') {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const token = generateToken(user._id);

      // Delete the used OTP
      await otpRecord.deleteOne();

      return res.status(200).json({
        success: true,
        message: 'OTP verified successfully',
        data: {
          user,
          token,
        },
      });
    }

    // For signup or password reset, just verify OTP
    await otpRecord.deleteOne();
    
    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
    });
  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
    });
  }
};

/**
 * @desc    Request password reset (sends OTP)
 * @route   POST /api/auth/request-reset
 * @access  Public
 */
export const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email',
      });
    }

    console.log('Processing password reset request for:', email);

    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email',
      });
    }

    // Generate and send OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log('Generated OTP for user:', { email, otp: '*****' });

    try {
      // First, save OTP to database
      await OTP.create({
        email: email.toLowerCase(),
        otp,
        type: 'reset',
      });
      console.log('OTP saved to database successfully');

      // Then try to send email
      await sendOTPEmail(email, otp);
      console.log('OTP email sent successfully');

      res.status(200).json({
        success: true,
        message: 'OTP sent successfully',
      });
    } catch (emailError) {
      // If email fails, delete the OTP record
      await OTP.deleteOne({ email: email.toLowerCase(), otp, type: 'reset' });
      console.error('Failed to complete OTP process:', emailError);
      throw emailError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('Request Password Reset Error:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: `Error sending password reset OTP: ${error.message}`,
    });
  }
};

/**
 * @desc    Update profile details and optional profile photo
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { name, branch, year, usn } = req.body;

    const validYears = ['1st', '2nd', '3rd', '4th'];
    const updates = {};

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) {
      updates.name = name.trim();
    }

    if (branch) {
      updates.branch = branch.trim();
    }

    if (year) {
      if (!validYears.includes(year)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid academic year. Please select from 1st to 4th year.',
        });
      }
      updates.year = year;
    }

    if (usn) {
      const formattedUsn = usn.trim().toUpperCase();
      const existingUser = await User.findOne({ usn: formattedUsn, _id: { $ne: userId } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'USN already in use by another member.',
        });
      }
      updates.usn = formattedUsn;
    }

    if (req.file?.path) {
      updates.profilePhoto = req.file.path;
    }

    Object.assign(user, updates);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
    });
  }
};

/**
 * @desc    Reset password with OTP
 * @route   POST /api/auth/reset
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, OTP, and new password',
      });
    }

    // Validate password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Find the latest reset OTP record for this email
    const otpRecord = await OTP.findOne({
      email: email.toLowerCase(),
      type: 'reset',
    }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please request a new one.',
      });
    }

    // Check if OTP matches
    if (otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a new one.',
      });
    }

    // Find user and update password
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.password = newPassword;
    await user.save();

    // Delete the used OTP
    await otpRecord.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
    });
  }
};
