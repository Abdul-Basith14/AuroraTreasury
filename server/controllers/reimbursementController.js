import Reimbursement from '../models/Reimbursement.js';
import User from '../models/User.js';
import { deleteImageFromCloudinary } from '../middleware/upload.js';

/**
 * @desc    Create a new reimbursement request
 * @route   POST /api/reimbursement/request
 * @access  Private (Member)
 */
export const createReimbursementRequest = async (req, res) => {
  try {
    const { name, year, mobileNumber, description, amount } = req.body;

    // Validate all required fields
    if (!name || !year || !mobileNumber || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, year, mobileNumber, description, amount',
      });
    }

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Bill proof photo is required',
      });
    }

    // Validate name length
    if (name.length < 3 || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Name must be between 3-100 characters',
      });
    }

    // Validate year
    const validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
    if (!validYears.includes(year)) {
      return res.status(400).json({
        success: false,
        message: 'Please select a valid academic year',
      });
    }

    // Validate mobile number (Indian format: 10 digits starting with 6-9)
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(mobileNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Valid 10-digit mobile number is required',
      });
    }

    // Validate description length
    if (description.length < 10 || description.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Description must be between 10-500 characters',
      });
    }

    // Validate amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > 100000) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0 and less than ₹1,00,000',
      });
    }

    // Create new reimbursement request
    const reimbursement = await Reimbursement.create({
      userId: req.user._id,
      name: name.trim(),
      year,
      mobileNumber,
      description: description.trim(),
      amount: parsedAmount,
      billProofPhoto: req.file.path, // Cloudinary URL
      status: 'Pending',
      requestDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Reimbursement request submitted successfully! Treasurer will review it soon.',
      data: {
        reimbursement,
      },
    });
  } catch (error) {
    console.error('Create Reimbursement Request Error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting reimbursement request. Please try again.',
    });
  }
};

/**
 * @desc    Get all reimbursement requests for logged-in user
 * @route   GET /api/reimbursement/my-requests
 * @access  Private (Member)
 */
export const getMyRequests = async (req, res) => {
  try {
    // Find all reimbursement requests for the logged-in user
    const reimbursements = await Reimbursement.find({ userId: req.user._id })
      .populate('treasurerResponse.respondedBy', 'name email role')
      .sort({ createdAt: -1 }); // Sort by newest first

    // Calculate summary statistics
    const summary = {
      total: reimbursements.length,
      pending: reimbursements.filter((r) => r.status === 'Pending').length,
      approved: reimbursements.filter((r) => r.status === 'Approved').length,
      paid: reimbursements.filter((r) => r.status === 'Paid').length,
      received: reimbursements.filter((r) => r.status === 'Received').length,
      rejected: reimbursements.filter((r) => r.status === 'Rejected').length,
      totalAmount: reimbursements.reduce((sum, r) => sum + r.amount, 0),
      totalReceived: reimbursements
        .filter((r) => r.status === 'Received')
        .reduce((sum, r) => sum + r.amount, 0),
    };

    res.status(200).json({
      success: true,
      data: {
        reimbursements,
        summary,
      },
    });
  } catch (error) {
    console.error('Get My Requests Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reimbursement requests',
    });
  }
};

/**
 * @desc    Get a single reimbursement request by ID
 * @route   GET /api/reimbursement/request/:id
 * @access  Private (Member - own requests only)
 */
export const getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find reimbursement by ID
    const reimbursement = await Reimbursement.findById(id).populate(
      'treasurerResponse.respondedBy',
      'name email role'
    );

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement request not found',
      });
    }

    // Security check: Verify the request belongs to the logged-in user
    if (reimbursement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this reimbursement request',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        reimbursement,
      },
    });
  } catch (error) {
    console.error('Get Request By ID Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reimbursement request',
    });
  }
};

/**
 * @desc    Confirm receipt of payment
 * @route   POST /api/reimbursement/confirm-receipt/:id
 * @access  Private (Member)
 */
export const confirmReceipt = async (req, res) => {
  try {
    const { id } = req.params;

    // Find reimbursement by ID
    const reimbursement = await Reimbursement.findById(id);

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement request not found',
      });
    }

    // Security check: Verify the request belongs to the logged-in user
    if (reimbursement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to modify this reimbursement request',
      });
    }

    // Check if status is 'Paid'
    if (reimbursement.status !== 'Paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot confirm receipt for ${reimbursement.status} request. Only Paid requests can be confirmed.`,
      });
    }

    // Update status to 'Received'
    reimbursement.status = 'Received';
    reimbursement.receivedDate = new Date();
    await reimbursement.save();

    res.status(200).json({
      success: true,
      message: 'Payment receipt confirmed successfully! Thank you.',
      data: {
        reimbursement,
      },
    });
  } catch (error) {
    console.error('Confirm Receipt Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error confirming receipt. Please try again.',
    });
  }
};

/**
 * @desc    Delete a reimbursement request
 * @route   DELETE /api/reimbursement/request/:id
 * @access  Private (Member - can only delete own Pending/Rejected requests)
 */
export const deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    // Find reimbursement by ID
    const reimbursement = await Reimbursement.findById(id);

    if (!reimbursement) {
      return res.status(404).json({
        success: false,
        message: 'Reimbursement request not found',
      });
    }

    // Security check: Verify the request belongs to the logged-in user
    if (reimbursement.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to delete this reimbursement request',
      });
    }

    // Check if request can be deleted (only Pending or Rejected)
    if (!['Pending', 'Rejected'].includes(reimbursement.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete ${reimbursement.status} request. Only Pending or Rejected requests can be deleted.`,
      });
    }

    // Delete bill proof photo from Cloudinary
    try {
      if (reimbursement.billProofPhoto) {
        // Extract public ID from Cloudinary URL
        const urlParts = reimbursement.billProofPhoto.split('/');
        const filename = urlParts[urlParts.length - 1];
        const publicId = `aurora-treasury/reimbursement-bills/${filename.split('.')[0]}`;
        
        await deleteImageFromCloudinary(publicId);
      }
    } catch (cloudinaryError) {
      console.error('Error deleting image from Cloudinary:', cloudinaryError);
      // Continue with deletion even if Cloudinary delete fails
    }

    // Delete reimbursement request
    await Reimbursement.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Reimbursement request deleted successfully',
    });
  } catch (error) {
    console.error('Delete Request Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting reimbursement request. Please try again.',
    });
  }
};

/**
 * @desc    Get reimbursement statistics for the user
 * @route   GET /api/reimbursement/statistics
 * @access  Private (Member)
 */
export const getStatistics = async (req, res) => {
  try {
    // Get all reimbursements for the user
    const reimbursements = await Reimbursement.find({ userId: req.user._id });

    // Calculate statistics
    const stats = {
      total: reimbursements.length,
      byStatus: {
        pending: reimbursements.filter((r) => r.status === 'Pending').length,
        approved: reimbursements.filter((r) => r.status === 'Approved').length,
        paid: reimbursements.filter((r) => r.status === 'Paid').length,
        received: reimbursements.filter((r) => r.status === 'Received').length,
        rejected: reimbursements.filter((r) => r.status === 'Rejected').length,
      },
      amounts: {
        total: reimbursements.reduce((sum, r) => sum + r.amount, 0),
        pending: reimbursements
          .filter((r) => r.status === 'Pending')
          .reduce((sum, r) => sum + r.amount, 0),
        approved: reimbursements
          .filter((r) => r.status === 'Approved')
          .reduce((sum, r) => sum + r.amount, 0),
        paid: reimbursements
          .filter((r) => r.status === 'Paid')
          .reduce((sum, r) => sum + r.amount, 0),
        received: reimbursements
          .filter((r) => r.status === 'Received')
          .reduce((sum, r) => sum + r.amount, 0),
        rejected: reimbursements
          .filter((r) => r.status === 'Rejected')
          .reduce((sum, r) => sum + r.amount, 0),
      },
      latestRequest: reimbursements.length > 0 
        ? reimbursements.sort((a, b) => b.createdAt - a.createdAt)[0]
        : null,
    };

    res.status(200).json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    console.error('Get Statistics Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching statistics',
    });
  }
};
