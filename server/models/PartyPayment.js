import mongoose from 'mongoose';

const partyPaymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  party: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PartyAmount',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'AwaitingVerification', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  // Unique payment reference code (e.g., AT-PARTY-P123-U456-20260117)
  paymentReference: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  // Whether member has clicked "I have paid"
  memberConfirmedPayment: {
    type: Boolean,
    default: false,
  },
  // Date when member confirmed payment
  memberConfirmedDate: {
    type: Date,
    default: null,
  },
  paymentMethod: {
    type: String,
    enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'],
    default: 'UPI',
  },
  submittedDate: {
    type: Date,
    default: Date.now,
  },
  verifiedDate: Date,
  paidDate: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verificationNote: String,
  statusHistory: [
    {
      status: String,
      by: mongoose.Schema.Types.ObjectId,
      timestamp: Date,
      reason: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('PartyPayment', partyPaymentSchema);
