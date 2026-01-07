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
    enum: ['Pending', 'Approved', 'Rejected', 'Paid'],
    default: 'Pending',
  },
  proofPhotos: [String], // allow multiple proof images
  paymentMethod: {
    type: String,
    enum: ['Online', 'Cash', 'Bank Transfer', 'Other'],
    default: 'Online',
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
