import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMonthBasedMemberList, deleteMonthlyRecords, createMonthlyRecords } from '../../utils/treasurerAPI';
import axios from 'axios';
import { Download, Trash2, Calendar, Users, IndianRupee, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import ManualPaymentUpdateModal from './ManualPaymentUpdateModal';

/**
 * Month-based Member List Component
 * Shows payment status for all members in a specific month (table view)
 */
const MembersListByMonth = () => {
  const [memberList, setMemberList] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingRecords, setCreatingRecords] = useState(false);
  const [showManualUpdateModal, setShowManualUpdateModal] = useState(false);
  const [selectedMemberForUpdate, setSelectedMemberForUpdate] = useState(null);
  const [clubSettings, setClubSettings] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current month and year and fetch club settings
  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear().toString();
    setSelectedMonth(month);
    setSelectedYear(year);
    
    // Fetch club settings for default amount
    fetchClubSettings();
  }, []);
  
  /**
   * Fetch club settings
   */
  const fetchClubSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/groupfund/settings`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setClubSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch club settings:', error);
    }
  };
  
  // Fetch member list when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchMemberList();
    }
    // Only refetch when month or year changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth, selectedYear]);
  
  // Filter members based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(memberList);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = memberList.filter(member => 
        member.name.toLowerCase().includes(query) ||
        member.usn.toLowerCase().includes(query) ||
        member.email?.toLowerCase().includes(query)
      );
      setFilteredMembers(filtered);
    }
  }, [searchQuery, memberList]);
  
  /**
   * Fetch member list for selected month
   */
  const fetchMemberList = async () => {
    setLoading(true);
    try {
      const data = await getMonthBasedMemberList(selectedMonth, selectedYear);
      console.log('📊 Fetched data:', data);
      
      if (!data) {
        console.error('❌ No data returned from API');
        setMemberList([]);
        setFilteredMembers([]);
        return;
      }
      
      // Transform data to flatten the structure for this component
      const transformedMembers = (data.members || []).map(member => ({
        _id: member._id || member.userId?._id, // Use userId._id as fallback for null payment records
        paymentId: member._id || null,
        name: member.userId?.name || 'N/A',
        usn: member.userId?.usn || 'N/A',
        year: member.userId?.year || 'N/A',
        branch: member.userId?.branch || 'N/A',
        paymentStatus: member.status,
        amount: member.amount || 0,
        paymentDate: member.paymentDate,
        paymentMethod: member.paymentMethod,
        paymentProof: member.paymentProof || null
      }));
      
      setMemberList(transformedMembers);
      setFilteredMembers(transformedMembers);
      setSummary(data.summary || {});
    } catch (error) {
      toast.error('Failed to load member list');
      console.error('Fetch member list error:', error);
      setMemberList([]);
      setFilteredMembers([]);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle download CSV
   */
  const handleDownload = () => {
    try {
      const csvData = [
        ['Name', 'USN', 'Year', 'Branch', 'Email', 'Payment Status', 'Amount', 'Payment Date'],
        ...memberList.map(m => [
          m.name,
          m.usn,
          m.year,
          m.branch,
          m.email,
          m.paymentStatus,
          m.amount,
          m.paymentDate ? new Date(m.paymentDate).toLocaleDateString('en-IN') : 'N/A'
        ])
      ];
      
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `member-list-${selectedMonth}-${selectedYear}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Member list downloaded');
    } catch (error) {
      toast.error('Failed to download');
      console.error('Download error:', error);
    }
  };
  
  /**
   * Create monthly records for all members
   */
  const handleCreateMonthlyRecords = async ({ amounts, deadline }) => {
    if (!amounts || !deadline) {
      toast.error('Please provide all required information');
      return;
    }

    setCreatingRecords(true);
    try {
      const data = await createMonthlyRecords({
        month: selectedMonth,
        year: parseInt(selectedYear),
        yearAmounts: amounts, // Array of { year: number, amount: number }
        deadline: deadline
      });
      
      toast.success(data.message || `Created payment records for ${data.count} members`);
      setShowCreateModal(false);
      await fetchMemberList(); // Refresh the list
    } catch (error) {
      console.error('Create monthly records error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create monthly records';
      toast.error(errorMsg);
    } finally {
      setCreatingRecords(false);
    }
  };

  /**
   * Handle delete monthly records
   */
  const handleDelete = async () => {
    try {
      const result = await deleteMonthlyRecords(selectedMonth, selectedYear);
      toast.success(`Deleted ${result.deletedCount} records`);
      setShowDeleteConfirm(false);
      fetchMemberList();
    } catch (error) {
      toast.error('Failed to delete records');
      console.error('Delete error:', error);
    }
  };
  
  /**
   * Handle manual payment update
   */
  const handleManualUpdate = (member) => {
    // Determine the default amount based on member's year
    let defaultAmount = 100; // Fallback default
    
    if (clubSettings && clubSettings.fundAmountByYear) {
      const yearMap = {
        '1st': clubSettings.fundAmountByYear.firstYear,
        '2nd': clubSettings.fundAmountByYear.secondYear,
        '3rd': clubSettings.fundAmountByYear.thirdYear,
        '4th': clubSettings.fundAmountByYear.fourthYear
      };
      defaultAmount = yearMap[member.year] || clubSettings.monthlyFundAmount || 100;
    }
    
    // Create payment object - only include _id if it exists and is valid
    const payment = {
      month: selectedMonth,
      year: parseInt(selectedYear),
      amount: member.amount > 0 ? member.amount : defaultAmount,
      status: member.paymentStatus
    };
    
    // Only add _id if paymentId is a valid string
    if (member.paymentId && typeof member.paymentId === 'string') {
      payment._id = member.paymentId;
    }
    
    setSelectedMemberForUpdate({ member, payment });
    setShowManualUpdateModal(true);
  };
  
  /**
   * Handle manual update success
   */
  const handleManualUpdateSuccess = () => {
    setShowManualUpdateModal(false);
    setSelectedMemberForUpdate(null);
    fetchMemberList(); // Refresh the list
  };
  
  /**
   * Navigate to previous month
   */
  const handlePreviousMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex === 0) {
      setSelectedMonth('December');
      setSelectedYear((parseInt(selectedYear) - 1).toString());
    } else {
      setSelectedMonth(months[currentIndex - 1]);
    }
  };
  
  /**
   * Navigate to next month
   */
  const handleNextMonth = () => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentIndex = months.indexOf(selectedMonth);
    if (currentIndex === 11) {
      setSelectedMonth('January');
      setSelectedYear((parseInt(selectedYear) + 1).toString());
    } else {
      setSelectedMonth(months[currentIndex + 1]);
    }
  };
  
  /**
   * Get status badge color
   */
  const getStatusBadge = (status) => {
    const configs = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200',
      'Not Created': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return configs[status] || configs['Not Created'];
  };
  
  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Members List by Month</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              Create Monthly Records
            </button>
            <button
              onClick={handleDownload}
              disabled={memberList.length === 0}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={memberList.length === 0 || summary?.paidCount === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Month
            </button>
          </div>
        </div>
        
        {/* Month Navigator */}
        <div className="flex items-center justify-center space-x-4 mb-4">
          <button
            onClick={handlePreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              {selectedMonth} {selectedYear}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, USN, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Summary Cards */}
      {summary && (
        <div className="p-6 border-b border-gray-200">
          {searchQuery && (
            <div className="mb-4 text-sm text-gray-600">
              Showing <span className="font-semibold text-blue-600">{filteredMembers.length}</span> of <span className="font-semibold">{summary.totalMembers}</span> members
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{summary.totalMembers}</div>
              <div className="text-xs text-blue-700">Total Members</div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{summary.paidCount}</div>
              <div className="text-xs text-green-700">Paid</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{summary.pendingCount}</div>
              <div className="text-xs text-yellow-700">Pending</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-900">{summary.failedCount}</div>
              <div className="text-xs text-red-700">Failed</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <IndianRupee className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">₹{summary.totalCollected}</div>
              <div className="text-xs text-purple-700">Collected</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Member List Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>{searchQuery ? `No members found matching "${searchQuery}"` : 'No members found'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  USN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member, index) => (
                <tr key={member._id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.usn}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.branch}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(member.paymentStatus)}`}>
                      {member.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {member.amount > 0 ? `₹${member.amount}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {member.paymentDate ? new Date(member.paymentDate).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {member.paymentStatus === 'Pending' && !member.paymentProof ? (
                      <button
                        onClick={() => handleManualUpdate(member)}
                        className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors duration-200"
                        title="Mark as paid (for cash/offline payments)"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Paid
                      </button>
                    ) : member.paymentStatus === 'Pending' && member.paymentProof ? (
                      <span className="text-sm text-yellow-700">Pending (awaiting verification)</span>
                    ) : member.paymentStatus === 'Paid' ? (
                      <span className="text-green-600 text-xs font-medium">✓ Paid</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="text-center">
              <Trash2 className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete Monthly Records?</h3>
              <p className="text-gray-600 mb-6">
                This will permanently delete all payment records for {selectedMonth} {selectedYear}. 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Manual Payment Update Modal */}
      {showManualUpdateModal && selectedMemberForUpdate && (
        <ManualPaymentUpdateModal
          isOpen={showManualUpdateModal}
          onClose={() => setShowManualUpdateModal(false)}
          payment={selectedMemberForUpdate.payment}
          member={selectedMemberForUpdate.member}
          onSuccess={handleManualUpdateSuccess}
        />
      )}

      {/* Create Monthly Records Modal */}
      {showCreateModal && (
        <CreateMonthlyRecordsModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMonthlyRecords}
          defaultAmount={clubSettings?.monthlyFundAmount || 100}
          month={selectedMonth}
          year={selectedYear}
          loading={creatingRecords}
        />
      )}
    </div>
  );
};

// Inline modal component
const CreateMonthlyRecordsModal = ({ isOpen, onClose, onSubmit, defaultAmount = 100, month, year, loading }) => {
  const [yearlyAmounts, setYearlyAmounts] = useState({
    '1': '',
    '2': '',
    '3': '',
    '4': ''
  });
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const defaultDate = new Date(parseInt(year), monthIndex, 5);
    setDeadline(defaultDate.toISOString().split('T')[0]);
    
    // Set default amounts if provided
    if (defaultAmount) {
      setYearlyAmounts({
        '1': String(defaultAmount),
        '2': String(defaultAmount),
        '3': String(defaultAmount),
        '4': String(defaultAmount)
      });
    }
  }, [month, year, defaultAmount]);

  const handleYearAmountChange = (year, value) => {
    setYearlyAmounts(prev => ({
      ...prev,
      [year]: value
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    
    // Validate all fields
    const amounts = Object.entries(yearlyAmounts).map(([year, amount]) => ({
      year: parseInt(year),
      amount: parseFloat(amount) || 0
    }));
    
    if (amounts.some(item => item.amount <= 0)) {
      toast.error('Please provide valid amounts for all years');
      return;
    }
    
    if (!deadline) {
      toast.error('Please provide a deadline');
      return;
    }
    
    onSubmit({ amounts, deadline });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold">Create Monthly Records</h3>
          <p className="text-sm text-gray-600">This will create Pending records for all members for {month} {year}.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-3">
            <h4 className="font-medium text-gray-700">Set Amount by Year (₹)</h4>
            {[1, 2, 3, 4].map(year => (
              <div key={year} className="flex items-center">
                <label className="w-16 text-sm font-medium">Year {year}:</label>
                <input
                  type="number"
                  min="1"
                  className="flex-1 border rounded-lg px-3 py-2"
                  value={yearlyAmounts[year] || ''}
                  onChange={(e) => handleYearAmountChange(year, e.target.value)}
                  disabled={loading}
                  placeholder={`Enter amount for Year ${year}`}
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Deadline</label>
            <input 
              type="date" 
              className="w-full border rounded-lg px-3 py-2" 
              value={deadline} 
              onChange={(e) => setDeadline(e.target.value)} 
              disabled={loading} 
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-4 py-2 border rounded-lg hover:bg-gray-50" 
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50" 
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Records'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembersListByMonth;
