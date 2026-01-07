import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getWallet, addMoneyToWallet, removeMoneyFromWallet } from '../../utils/treasurerAPI';
import { Wallet, Plus, Minus, IndianRupee, TrendingUp, TrendingDown, Clock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [selectedMonth, setSelectedMonth] = useState('Current');
  
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
      <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20">
        <div className="animate-pulse">
          <div className="h-8 bg-[#A6C36F]/10 rounded w-48 mb-4"></div>
          <div className="h-32 bg-[#A6C36F]/10 rounded-2xl mb-6"></div>
          <div className="h-6 bg-[#A6C36F]/10 rounded w-full mb-3"></div>
          <div className="h-10 bg-[#A6C36F]/10 rounded-lg"></div>
        </div>
      </div>
    );
  }
  
  // Custom Button classes from the theme
  const accentButtonClasses = "bg-[#A6C36F] text-black hover:bg-[#8FAE5D] transition-all duration-300 rounded-2xl px-6 py-3 font-semibold disabled:opacity-50";
  const removeButtonClasses = "bg-red-600 text-white hover:bg-red-700 transition-all duration-300 rounded-2xl px-6 py-3 font-semibold disabled:opacity-50";
  const defaultButtonClasses = "bg-black/40 text-[#F5F3E7] hover:bg-[#A6C36F]/10 transition-all duration-300 rounded-2xl px-6 py-3 font-semibold border border-[#A6C36F]/20";

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wallet className="w-8 h-8 text-[#A6C36F] mr-3" />
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
            className={`flex items-center px-4 py-2 bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 rounded-2xl font-semibold`}
          >
            <Minus className="w-5 h-5 mr-2" />
            Remove Money
          </button>
        </div>
      </div>
      
      {/* Balance Card */}
      <div className="bg-black/40 border border-[#A6C36F]/20 rounded-2xl p-8 mb-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] hover:shadow-[0_0_20px_rgba(166,195,111,0.2)] transition-shadow duration-300">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-[#E8E3C5] opacity-90 mb-2">Current Balance</p>
            <div className="flex items-center">
              <IndianRupee className="w-10 h-10 mr-2 text-[#A6C36F]" />
              <span className="text-5xl font-bold text-[#A6C36F]">
                {wallet?.balance?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            {wallet?.lastUpdatedBy && (
              <p className="text-xs text-[#E8E3C5]/70 mt-3">
                Last updated by {wallet.lastUpdatedBy.name}
              </p>
            )}
          </div>
          <Wallet className="w-32 h-32 text-[#A6C36F]/10 opacity-20" />
        </div>
      </div>
      
      
      {/* Transaction History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[#E8E3C5] text-lg font-semibold tracking-wide uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#A6C36F]" />
            Monthly Transactions
          </h3>
          
          {wallet?.transactions && wallet.transactions.length > 0 && (
            <div className="relative">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="appearance-none bg-[#0B0B09] border border-[#A6C36F]/30 text-[#F5F3E7] text-sm rounded-xl px-4 py-2 pr-10 focus:outline-none focus:border-[#A6C36F] focus:ring-1 focus:ring-[#A6C36F] transition-all duration-300 cursor-pointer font-medium"
              >
                {Object.keys(
                  wallet.transactions.reduce((acc, transaction) => {
                    const date = new Date(transaction.date);
                    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    acc[monthYear] = true;
                    return acc;
                  }, {})
                ).map((month) => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A6C36F] pointer-events-none" />
            </div>
          )}
        </div>

        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar bg-black/20 rounded-xl border border-[#A6C36F]/10 p-1">
            {(() => {
              // Group transactions by month first to find available months
              const groupedTransactions = wallet.transactions.reduce((acc, transaction) => {
                const date = new Date(transaction.date);
                const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                if (!acc[monthYear]) acc[monthYear] = [];
                acc[monthYear].push(transaction);
                return acc;
              }, {});

              // Determine which month to show (either selected or the first available one)
              const availableMonths = Object.keys(groupedTransactions);
              const activeMonth = selectedMonth === 'Current' && availableMonths.length > 0 
                ? availableMonths[0] 
                : (groupedTransactions[selectedMonth] ? selectedMonth : availableMonths[0]);
                
              const transactionsToShow = groupedTransactions[activeMonth] || [];

              return (
                <div className="animate-in fade-in duration-300">
                  <div className="px-4 py-3 border-b border-[#A6C36F]/10 flex justify-between items-center bg-[#A6C36F]/5 rounded-t-lg mb-1">
                    <span className="text-sm font-bold text-[#A6C36F]">{activeMonth}</span>
                    <span className="text-xs text-[#E8E3C5]/50 font-mono bg-black/40 px-2 py-1 rounded border border-[#A6C36F]/10">{transactionsToShow.length} Transactions</span>
                  </div>
                  
                  {transactionsToShow.map((transaction, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 hover:bg-[#A6C36F]/5 transition-colors duration-200 border-b border-[#A6C36F]/5 last:border-0 last:rounded-b-lg"
                    >
                      <div className="flex items-center space-x-4">
                        {transaction.type === 'credit' ? (
                          <div className="p-2 bg-[#A6C36F]/10 rounded-full border border-[#A6C36F]/20 shadow-[0_0_10px_rgba(166,195,111,0.1)]">
                            <TrendingUp className="w-5 h-5 text-[#A6C36F]" />
                          </div>
                        ) : (
                          <div className="p-2 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-[#F5F3E7] text-sm">{transaction.description}</p>
                          <div className="flex items-center space-x-3 text-xs text-[#E8E3C5]/50 mt-1 font-mono">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1 opacity-70" />
                              {new Date(transaction.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>• By {transaction.treasurerId?.name || 'System'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-base font-black ${
                          transaction.type === 'credit' ? 'text-[#A6C36F]' : 'text-red-400'
                        }`}>
                          {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] text-[#E8E3C5]/40 mt-1 uppercase tracking-widest font-semibold">
                          Bal: ₹{transaction.newBalance.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="text-center py-12 text-[#E8E3C5]/70 bg-black/20 rounded-xl border border-[#A6C36F]/10 border-dashed">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-[#A6C36F]/20" />
            <p>No transactions found</p>
          </div>
        )}
      </div>
      
      {/* Add Money Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 rounded-2xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20">
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
                  className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg bg-black/40 text-[#F5F3E7] focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg bg-black/40 text-[#F5F3E7] focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent outline-none"
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-black/90 rounded-2xl max-w-md w-full p-6 shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20">
            <h3 className="text-xl font-bold text-[#F5F3E7] mb-4">Remove Money from Wallet</h3>
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
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
                  className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg bg-black/40 text-[#F5F3E7] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                  className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg bg-black/40 text-[#F5F3E7] focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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