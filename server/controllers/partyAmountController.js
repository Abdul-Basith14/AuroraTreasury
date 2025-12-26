import PartyAmount from '../models/PartyAmount.js';
import PartyPayment from '../models/PartyPayment.js';
import User from '../models/User.js';

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

// Submit a party payment (member)
export const submitPartyPayment = async (req, res) => {
  try {
    const { partyId } = req.body;
    if (!partyId) return res.status(400).json({ message: 'partyId required' });

    const party = await PartyAmount.findById(partyId);
    if (!party) return res.status(404).json({ message: 'Party not found' });

    const existing = await PartyPayment.findOne({ party: partyId, member: req.user.id });
    if (existing) return res.status(400).json({ message: 'You have already submitted payment for this party' });

    const payment = new PartyPayment({
      party: partyId,
      member: req.user.id,
      amount: party.amountPerMember,
      statusHistory: [
        { status: 'Pending', by: req.user.id, reason: 'Submitted payment', timestamp: new Date() }
      ],
      proofPhotos: req.files ? req.files.map(f => f.path || f.filename || f.secure_url || f.url) : [],
    });

    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Treasurer verifies a payment
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, action, reason } = req.body; // action: approve/reject/mark-paid
    const payment = await PartyPayment.findById(paymentId);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    if (action === 'approve') {
      payment.status = 'Approved';
      payment.statusHistory.push({ status: 'Approved', by: req.user.id, reason: reason || 'Approved by treasurer', timestamp: new Date() });
      await payment.save();
      return res.json(payment);
    }

    if (action === 'reject') {
      payment.status = 'Rejected';
      payment.statusHistory.push({ status: 'Rejected', by: req.user.id, reason: reason || 'Rejected by treasurer', timestamp: new Date() });
      await payment.save();
      return res.json(payment);
    }

    if (action === 'mark-paid') {
      // Mark final paid: update user's partyContributionsWallet / totalPartyPaid and update party totals
      payment.status = 'Paid';
      payment.statusHistory.push({ status: 'Paid', by: req.user.id, reason: reason || 'Marked paid by treasurer', timestamp: new Date() });
      await payment.save();

      const user = await User.findById(payment.member);
      if (user) {
        user.totalPartyPaid = (user.totalPartyPaid || 0) + payment.amount;
        await user.save();
      }

      const party = await PartyAmount.findById(payment.party);
      if (party) {
        party.totalCollected = (party.totalCollected || 0) + payment.amount;
        if (!party.membersContributed.includes(payment.member.toString())) {
          party.membersContributed.push(payment.member.toString());
        }
        await party.save();
      }

      return res.json(payment);
    }

    res.status(400).json({ message: 'Invalid action' });
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
  submitPartyPayment,
  verifyPayment,
  getPartyPayments,
  getMyPartyPayments,
  getActivePartyAmounts,
  getPartyWallet,
};
