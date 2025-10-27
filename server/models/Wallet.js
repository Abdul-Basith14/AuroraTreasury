import mongoose from 'mongoose';

/**
 * Wallet Schema for Aurora Treasury
 * Tracks club's total wallet balance with transaction history
 */
const walletSchema = new mongoose.Schema(
  {
    // Current balance in wallet
    balance: {
      type: Number,
      default: 0,
      min: [0, 'Balance cannot be negative'],
    },

    // Transaction history
    transactions: [
      {
        type: {
          type: String,
          enum: ['credit', 'debit'],
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Amount must be positive'],
        },
        description: {
          type: String,
          required: true,
          maxlength: [200, 'Description cannot exceed 200 characters'],
        },
        treasurerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        previousBalance: {
          type: Number,
          required: true,
        },
        newBalance: {
          type: Number,
          required: true,
        },
      },
    ],

    // Last updated by
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Method to add money to wallet
 */
walletSchema.methods.addMoney = function (amount, description, treasurerId) {
  const previousBalance = this.balance;
  this.balance += amount;
  
  this.transactions.push({
    type: 'credit',
    amount,
    description,
    treasurerId,
    previousBalance,
    newBalance: this.balance,
  });
  
  this.lastUpdatedBy = treasurerId;
  return this.save();
};

/**
 * Method to remove money from wallet
 */
walletSchema.methods.removeMoney = function (amount, description, treasurerId) {
  if (amount > this.balance) {
    throw new Error('Insufficient balance');
  }
  
  const previousBalance = this.balance;
  this.balance -= amount;
  
  this.transactions.push({
    type: 'debit',
    amount,
    description,
    treasurerId,
    previousBalance,
    newBalance: this.balance,
  });
  
  this.lastUpdatedBy = treasurerId;
  return this.save();
};

/**
 * Static method to get or create wallet
 */
walletSchema.statics.getWallet = async function () {
  let wallet = await this.findOne();
  if (!wallet) {
    wallet = await this.create({ balance: 0 });
  }
  return wallet;
};

const Wallet = mongoose.model('Wallet', walletSchema);

export default Wallet;
