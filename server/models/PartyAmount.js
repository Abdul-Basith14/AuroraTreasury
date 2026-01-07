import mongoose from 'mongoose';

const partyAmountSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  partyName: {
    type: String,
    required: true
  },
  partyDescription: String,
  partyDate: Date,
  deadline: Date,
  amounts: {
    year1: { type: Number, default: 0 },
    year2: { type: Number, default: 0 },
    year3: { type: Number, default: 0 },
    year4: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Active', 'Closed', 'Cancelled'],
    default: 'Active'
  },
  totalCollected: {
    type: Number,
    default: 0
  },
  membersContributed: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('PartyAmount', partyAmountSchema);
