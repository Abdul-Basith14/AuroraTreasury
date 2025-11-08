import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getWallet, addMoneyToWallet, removeMoneyFromWallet } from '../../utils/treasurerAPI';
import { Wallet, Plus, Minus, IndianRupee, TrendingUp, TrendingDown, Clock } from 'lucide-react';

/**
 * Wallet Management Component
 * Allows treasurer to manage club wallet balance
 */
const WalletManagement = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    fetchWallet();
  }, []);
  
  /**
    * Fetch wallet data
    */
  const fetchWallet = async () => {
    setLoading(true);
    try {
      const data = await getWallet();
      setWallet(data.wallet);
    } catch (error) {
      toast.error('Failed to load wallet');
      console.error('Fetch wallet error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
    * Handle adding money
    */
  const handleAddMoney = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    setProcessing(true);
    try {
      await addMoneyToWallet(parseFloat(amount), description);
      toast.success('Money added successfully');
      setShowAddModal(false);
      setAmount('');
      setDescription('');
      fetchWallet();
    } catch (error) {
      toast.error(error.message || 'Failed to add money');
    } finally {
      setProcessing(false);
    }
  };
  
  /**
    * Handle removing money
    */
  const handleRemoveMoney = async (e) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please enter a description');
      return;
    }
    
    if (wallet && parseFloat(amount) > wallet.balance) {
      toast.error('Insufficient balance');
      return;
    }
    
    setProcessing(true);
    try {
      await removeMoneyFromWallet(parseFloat(amount), description);
      toast.success('Money removed successfully');
      setShowRemoveModal(false);
      setAmount('');
      setDescription('');
      fetchWallet();
    } catch (error) {
      toast.error(error.message || 'Failed to remove money');
    } finally {
      setProcessing(false);
    }
  };
  
  // Custom Loading/Skeleton in theme colors
  if (loading) {
    return (
      <div className="bg-[#1F221C] rounded-2xl p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] ring-1 ring-[#3A3E36]/40">
        <div className="animate-pulse">
          <div className="h-8 bg-[#3A3E36]/50 rounded w-48 mb-4"></div>
          <div className="h-32 bg-[#3A3E36]/50 rounded-2xl mb-6"></div>
          <div className="h-6 bg-[#3A3E36]/50 rounded w-full mb-3"></div>
          <div className="h-10 bg-[#3A3E36]/50 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  // Custom Button classes from the theme
  const accentButtonClasses = "bg-[#A6C36F] text-[#0B0B09] hover:bg-[#8FAE5D] transition-all duration-300 rounded-2xl px-6 py-3 font-semibold disabled:opacity-50";
  const removeButtonClasses = "bg-red-700 text-[#F5F3E7] hover:bg-red-800 transition-all duration-300 rounded-2xl px-6 py-3 font-semibold disabled:opacity-50";
  const defaultButtonClasses = "bg-[#3A3E36]/40 text-[#F5F3E7] hover:bg-[#3A3E36] transition-all duration-300 rounded-2xl px-6 py-3 font-semibold";

  return (
    <div className="bg-[#1F221C] rounded-2xl p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] ring-1 ring-[#3A3E36]/40">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          {/* Icon Tone: text-[#A6C36F]/80 */}
          <Wallet className="w-8 h-8 text-[#A6C36F]/80 mr-3" />
          {/* Header Text: text-[#F5F3E7] */}
          <h2 className="text-xl font-bold text-[#F5F3E7]">Club Wallet</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className={`flex items-center px-4 py-2 ${accentButtonClasses.replace('px-6 py-3', 'px-4 py-2')}`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Money
          </button>
          <button
            onClick={() => setShowRemoveModal(true)}
            // Using a distinct color for danger/remove action
            className={`flex items-center px-4 py-2 bg-red-700 text-[#F5F3E7] hover:bg-red-800 transition-colors duration-200 rounded-2xl font-semibold`}
          >
            <Minus className="w-5 h-5 mr-2" />
            Remove Money
          </button>
        </div>
      </div>
      
      {/* Balance Card */}
      {/* Replicating Card Container style but with the glow effect */}
      <div className="bg-[#1F221C] border border-[#3A3E36]/40 rounded-2xl p-8 mb-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] hover:shadow-[0_0_20px_rgba(166,195,111,0.2)] transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            {/* Soft Text: text-[#E8E3C5] */}
            <p className="text-sm text-[#E8E3C5] opacity-90 mb-2">Current Balance</p>
            <div className="flex items-center">
              {/* Accent Color for Icon and Primary Number Display */}
              <IndianRupee className="w-10 h-10 mr-2 text-[#A6C36F]" />
              <span className="text-5xl font-bold text-[#A6C36F]">
                {wallet?.balance?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            {wallet?.lastUpdatedBy && (
              // Softer Beige: text-[#E8E3C5]/70
              <p className="text-xs text-[#E8E3C5]/70 mt-3">
                Last updated by {wallet.lastUpdatedBy.name}
              </p>
            )}
          </div>
          {/* Icon Tone: text-[#A6C36F]/20 (softer accent for background visual) */}
          <Wallet className="w-32 h-32 text-[#A6C36F]/20 opacity-20" />
        </div>
      </div>
      
      {/* Transaction History */}
      <div>
        {/* Soft Header Text */}
        <h3 className="text-[#E8E3C5] text-lg font-semibold tracking-wide uppercase mb-4">
          Recent Transactions
        </h3>
        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {wallet.transactions.map((transaction, index) => (
              <div
                key={index}
                // Panel/Card style for list item
                className="flex items-center justify-between p-4 bg-[#0B0B09] border border-[#3A3E36]/40 rounded-lg hover:bg-[#1F221C] transition-colors duration-200 hover-glow"
              >
                <div className="flex items-center space-x-4">
                  {transaction.type === 'credit' ? (
                    // Accent Olive background with brighter text for credit
                    <div className="p-2 bg-[#A6C36F]/20 rounded-full">
                      <TrendingUp className="w-6 h-6 text-[#A6C36F]" />
                    </div>
                  ) : (
                    // Red for debit/remove
                    <div className="p-2 bg-red-700/20 rounded-full">
                      <TrendingDown className="w-6 h-6 text-red-500" />
                    </div>
                  )}
                  <div>
                    {/* Primary Text */}
                    <p className="font-semibold text-[#F5F3E7]">{transaction.description}</p>
                    {/* Secondary/Muted Text */}
                    <div className="flex items-center space-x-3 text-sm text-[#E8E3C5]/60 mt-1">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1 text-[#A6C36F]/80" />
                        {new Date(transaction.date).toLocaleString('en-IN')}
                      </span>
                      <span>By {transaction.treasurerId?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    // Accent Olive for credit, Red for debit
                    transaction.type === 'credit' ? 'text-[#A6C36F]' : 'text-red-500'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹ {transaction.amount.toLocaleString('en-IN')}
                  </p>
                  {/* Softer Beige for balance */}
                  <p className="text-xs text-[#E8E3C5]/60 mt-1">
                    Balance: ₹ {transaction.newBalance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#E8E3C5]/70">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-[#3A3E36]/40" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
      
      {/* Add Money Modal */}
      {showAddModal && (
        // Modal Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          {/* Modal Content - Card Container Style */}
          <div className="bg-[#1F221C] rounded-2xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] ring-1 ring-[#3A3E36]/40">
            <h3 className="text-xl font-bold text-[#F5F3E7] mb-4">Add Money to Wallet</h3>
            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  // Input Styling
                  className="w-full px-4 py-2 border border-[#3A3E36] rounded-lg bg-[#0B0B09] text-[#F5F3E7] focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent outline-none"
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (e.g., Monthly contribution, Event funds)"
                  // Input Styling
                  className="w-full px-4 py-2 border border-[#3A3E36] rounded-lg bg-[#0B0B09] text-[#F5F3E7] focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent outline-none"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAmount('');
                    setDescription('');
                  }}
                  className={`flex-1 ${defaultButtonClasses}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 ${accentButtonClasses}`}
                >
                  {processing ? 'Adding...' : 'Add Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Remove Money Modal */}
      {showRemoveModal && (
        // Modal Backdrop
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          {/* Modal Content - Card Container Style */}
          <div className="bg-[#1F221C] rounded-2xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] ring-1 ring-[#3A3E36]/40">
            <h3 className="text-xl font-bold text-[#F5F3E7] mb-4">Remove Money from Wallet</h3>
            {/* Danger Alert Style */}
            <div className="mb-4 p-3 bg-red-900/40 border border-red-700/40 rounded-lg">
              <p className="text-sm text-red-300">
                <strong className="text-red-200">Available Balance:</strong> ₹ {wallet?.balance?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <form onSubmit={handleRemoveMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  // Input Styling
                  className="w-full px-4 py-2 border border-[#3A3E36] rounded-lg bg-[#0B0B09] text-[#F5F3E7] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  min="1"
                  step="0.01"
                  max={wallet?.balance}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (e.g., Equipment purchase, Event expense)"
                  // Input Styling
                  className="w-full px-4 py-2 border border-[#3A3E36] rounded-lg bg-[#0B0B09] text-[#F5F3E7] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  rows="3"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setAmount('');
                    setDescription('');
                  }}
                  className={`flex-1 ${defaultButtonClasses}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className={`flex-1 ${removeButtonClasses}`}
                >
                  {processing ? 'Removing...' : 'Remove Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement;