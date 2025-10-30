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
  
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Wallet className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Club Wallet</h2>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Money
          </button>
          <button
            onClick={() => setShowRemoveModal(true)}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
          >
            <Minus className="w-5 h-5 mr-2" />
            Remove Money
          </button>
        </div>
      </div>
      
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">Current Balance</p>
            <div className="flex items-center">
              <IndianRupee className="w-10 h-10 mr-2" />
              <span className="text-5xl font-bold">
                {wallet?.balance?.toLocaleString('en-IN') || 0}
              </span>
            </div>
            {wallet?.lastUpdatedBy && (
              <p className="text-xs opacity-75 mt-3">
                Last updated by {wallet.lastUpdatedBy.name}
              </p>
            )}
          </div>
          <Wallet className="w-32 h-32 opacity-20" />
        </div>
      </div>
      
      {/* Transaction History */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
        {wallet?.transactions && wallet.transactions.length > 0 ? (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wallet.transactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  {transaction.type === 'credit' ? (
                    <div className="p-2 bg-green-100 rounded-full">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  ) : (
                    <div className="p-2 bg-red-100 rounded-full">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{transaction.description}</p>
                    <div className="flex items-center space-x-3 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(transaction.date).toLocaleString('en-IN')}
                      </span>
                      <span>By {transaction.treasurerId?.name}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹ {transaction.amount.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    Balance: ₹ {transaction.newBalance.toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Wallet className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No transactions yet</p>
          </div>
        )}
      </div>
      
      {/* Add Money Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Add Money to Wallet</h3>
            <form onSubmit={handleAddMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (e.g., Monthly contribution, Event funds)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Remove Money from Wallet</h3>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Available Balance:</strong> ₹ {wallet?.balance?.toLocaleString('en-IN') || 0}
              </p>
            </div>
            <form onSubmit={handleRemoveMoney}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  min="1"
                  step="0.01"
                  max={wallet?.balance}
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description (e.g., Equipment purchase, Event expense)"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
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
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 disabled:opacity-50"
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
