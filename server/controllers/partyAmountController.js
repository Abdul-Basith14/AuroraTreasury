import PartyAmount from '../models/PartyAmount.js';
import PartyPayment from '../models/PartyPayment.js';
import User from '../models/User.js';
import ClubSettings from '../models/ClubSettings.js';
import { generatePaymentReference, generateQRData } from '../utils/qrCodeUtils.js';

// Create a new party amount (treasurer)
export const createPartyAmount = async (req, res) => {
  try {
    const { name, description, amountPerMember, year, members } = req.body;

    const party = new PartyAmount({
      createdBy: req.user.id,
      name,
      description,
      amountPerMember,
      year,
      members: members || [],
      totalCollected: 0,
      membersContributed: []
    });

    await party.save();
    res.status(201).json(party);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all party amounts (paginated optional)
export const getAllPartyAmounts = async (req, res) => {
  try {
    const parties = await PartyAmount.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Generate QR code for party payment (member)
export const generatePartyQR = async (req, res) => {
  try {
    const { partyId } = req.params;

    const party = await PartyAmount.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    // Check if payment already exists
    let payment = await PartyPayment.findOne({ party: partyId, member: req.user.id });
    
    if (payment && payment.status !== 'Pending') {
      return res.status(400).json({ message: 'Payment already processed' });
    }

    // Get club settings for treasurer UPI
    const settings = await ClubSettings.findOne();
      const treasurerUPI = settings?.treasurerUPI || process.env.TREASURER_UPI;
      if (!treasurerUPI) {
      return res.status(500).json({ message: 'Treasurer UPI not configured' });
    }

    // Create or update payment with reference
    if (!payment) {
      const reference = generatePaymentReference('PARTY', partyId, req.user.id);
      payment = new PartyPayment({
        party: partyId,
        member: req.user.id,
        amount: party.amountPerMember,
        paymentReference: reference,
        status: 'Pending',
        statusHistory: [
          { status: 'Pending', by: req.user.id, reason: 'QR code generated', timestamp: new Date() }
        ],
      });
      await payment.save();
    }

    // Generate QR data
    const qrData = generateQRData({
      type: 'PARTY',
      paymentId: partyId,
      userId: req.user.id,
      amount: party.amountPerMember,
      treasurerUPI,
      fundName: party.name,
    });

    res.status(200).json({ 
      success: true,
      qrData,
      payment 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Member confirms payment (after paying via UPI)
export const confirmPartyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await PartyPayment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.member.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (payment.memberConfirmedPayment) {
      return res.status(400).json({ message: 'Payment already confirmed' });
    }

    payment.memberConfirmedPayment = true;
    payment.memberConfirmedDate = new Date();
    payment.status = 'AwaitingVerification';
    payment.statusHistory.push({
      status: 'AwaitingVerification',
      by: req.user.id,
      reason: 'Member confirmed payment',
      timestamp: new Date()
    });

    await payment.save();
    res.status(200).json({ 
      success: true,
      message: 'Payment confirmation received. Awaiting treasurer verification.',
      payment 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Treasurer verifies a payment by matching reference
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { action, reason } = req.body; // action: approve/reject
    
    const payment = await PartyPayment.findById(paymentId).populate('member', 'name email');
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (payment.status === 'Paid') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    if (action === 'approve') {
      // Mark as approved and paid
      payment.status = 'Paid';
      payment.verifiedBy = req.user.id;
      payment.verifiedDate = new Date();
      payment.paidDate = new Date();
      payment.verificationNote = reason || 'Reference verified in bank statement';
      payment.statusHistory.push({ 
        status: 'Paid', 
        by: req.user.id, 
        reason: reason || 'Payment reference verified by treasurer', 
        timestamp: new Date() 
      });
      
      await payment.save();

      // Update user's total party paid
      const user = await User.findById(payment.member);
      if (user) {
        user.totalPartyPaid = (user.totalPartyPaid || 0) + payment.amount;
        await user.save();
      }

      // Update party totals
      const party = await PartyAmount.findById(payment.party);
      if (party) {
        party.totalCollected = (party.totalCollected || 0) + payment.amount;
        if (!party.membersContributed.includes(payment.member.toString())) {
          party.membersContributed.push(payment.member.toString());
        }
        await party.save();
      }

      return res.json({ 
        success: true,
        message: 'Payment verified successfully',
        payment 
      });
    }

    if (action === 'reject') {
      payment.status = 'Rejected';
      payment.verificationNote = reason || 'Reference not found in bank statement';
      payment.statusHistory.push({ 
        status: 'Rejected', 
        by: req.user.id, 
        reason: reason || 'Payment reference not verified', 
        timestamp: new Date() 
      });
      await payment.save();
      
      return res.json({ 
        success: true,
        message: 'Payment rejected',
        payment 
      });
    }

    res.status(400).json({ message: 'Invalid action. Use approve or reject' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get payments for a party (treasurer view)
export const getPartyPayments = async (req, res) => {
  try {
    const { partyId } = req.params;
    const payments = await PartyPayment.find({ party: partyId }).populate('member', 'name email');
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get my payments (member)
export const getMyPartyPayments = async (req, res) => {
  try {
    const payments = await PartyPayment.find({ member: req.user.id }).populate('party');
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get active parties (not fully implemented: returning all for now)
export const getActivePartyAmounts = async (req, res) => {
  try {
    const parties = await PartyAmount.find().sort({ createdAt: -1 });
    res.json(parties);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get party wallet summary
export const getPartyWallet = async (req, res) => {
  try {
    const { partyId } = req.params;
    const party = await PartyAmount.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    res.json({ totalCollected: party.totalCollected, amountPerMember: party.amountPerMember, membersContributed: party.membersContributed.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export default {
  createPartyAmount,
  getAllPartyAmounts,
  generatePartyQR,
  confirmPartyPayment,
  verifyPayment,
  getPartyPayments,
  getMyPartyPayments,
  getActivePartyAmounts,
  getPartyWallet,
};
