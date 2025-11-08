import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema for Aurora Treasury
 * Supports two roles: member and treasurer
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    usn: {
      type: String,
      required: [true, 'Please provide your USN (University Seat Number)'],
      unique: true,
      uppercase: true,
      trim: true,
      match: [/^[A-Z0-9]+$/, 'USN must contain only letters and numbers'],
    },
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password in queries by default
    },
    year: {
      type: String,
      required: [true, 'Please provide your academic year'],
      enum: ['1st', '2nd', '3rd', '4th'],
    },
    branch: {
      type: String,
      required: [true, 'Please provide your branch/department'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['member', 'treasurer'],
      default: 'member',
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Hash password before saving to database
 * Only hash if password is modified
 */
// Add reset password fields to schema
userSchema.add({
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Method to compare entered password with hashed password in database
 * @param {string} enteredPassword - The password entered by user
 * @returns {boolean} - True if passwords match
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Method to generate user response object (without sensitive data)
 * @returns {object} - User object without password
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
