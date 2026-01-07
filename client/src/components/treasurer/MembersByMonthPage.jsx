import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Search,
  CheckCircle,
  Calendar,
  Users,
  ArrowLeft,
  X
} from 'lucide-react';
import { 
  getMonthBasedMemberList, 
  manualPaymentUpdate,
  createMonthlyRecords 
} from '../../utils/treasurerAPI';

/**
 * Members List by Month Page
 * Displays all members' payment status for a specific month
 */
const MembersByMonthPage = () => {
  const navigate = useNavigate();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingRecords, setCreatingRecords] = useState(false);
  
  // Get current month and year
  const monthName = currentDate.toLocaleString('en-US', { month: 'long' });
  const yearNumber = currentDate.getFullYear();
  
  // Fetch members for current month
  useEffect(() => {
    fetchMembersForMonth();
  }, [currentDate]);
  
  const fetchMembersForMonth = async () => {
    setLoading(true);
    try {
      const data = await getMonthBasedMemberList(monthName, yearNumber);
      console.log('🔍 API Response for', monthName, yearNumber, ':', data);
      console.log('🔍 Members array:', data.members);
      console.log('🔍 Members count:', data.members?.length || 0);
      
      if (data.members && data.members.length > 0) {
        console.log('🔍 First member sample:', {
          name: data.members[0].userId?.name,
          usn: data.members[0].userId?.usn,
          status: data.members[0].status
        });
      }
      
      setMembers(data.members || []);
    } catch (error) {
      console.error('❌ Error fetching members:', error);
      toast.error('Failed to load members for this month');
    } finally {
      setLoading(false);
    }
  };
  
  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };
  
  // Mark as paid
  const handleMarkPaid = async (payment) => {
    if (!window.confirm(`Mark payment as paid for ${payment.userId.name}?`)) {
      return;
    }
    
    try {
      await manualPaymentUpdate(payment._id, {
        paymentMethod: 'Cash',
        note: 'Manually marked as paid by treasurer'
      });
      
      toast.success('Payment marked as paid!');
        
        // Do NOT emit a global paymentVerified event for manual list actions.
        // Only refresh the local members list.
        await fetchMembersForMonth();
      
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error(error.message || 'Failed to mark as paid');
    }
  };
  
  // Create monthly records for all members
  const handleCreateMonthlyRecords = async (amount, deadline) => {
    setCreatingRecords(true);
    try {
      const data = await createMonthlyRecords({
        month: monthName,
        year: yearNumber,
        amount: parseFloat(amount),
        deadline: deadline
      });
      
      toast.success(data.message || `Created ${data.count} payment records!`);
      setShowCreateModal(false);
      
      // Refresh the list
      await fetchMembersForMonth();
    } catch (error) {
      console.error('Error creating monthly records:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create monthly records';
      toast.error(errorMsg);
    } finally {
      setCreatingRecords(false);
    }
  };
  
  // Download CSV
  const handleDownloadCSV = () => {
    try {
      // Prepare CSV data
      const csvData = [
        ['#', 'Name', 'USN', 'Year', 'Branch', 'Status', 'Amount', 'Payment Date'],
        ...filteredMembers.map((payment, index) => [
          index + 1,
          payment.userId.name,
          payment.userId.usn,
          payment.userId.year,
          payment.userId.branch,
          payment.status,
          payment.status === 'Paid' ? payment.amount : '-',
          payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString('en-IN') : '-'
        ])
      ];
      
      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `members-${monthName}-${yearNumber}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download CSV');
    }
  };
  
  // Filter members
  const filteredMembers = members.filter(payment => {
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'paid' && payment.status !== 'Paid') return false;
      if (statusFilter === 'pending' && payment.status !== 'Pending') return false;
      if (statusFilter === 'failed' && payment.status !== 'Failed') return false;
      if (statusFilter === 'not-created' && payment.status !== 'Not Created') return false;
    }
    
    // Year filter
    if (yearFilter !== 'all' && payment.userId.year !== yearFilter) return false;
    
    // Search filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      return (
        payment.userId.name.toLowerCase().includes(searchLower) ||
        payment.userId.usn.toLowerCase().includes(searchLower) ||
        (payment.userId.email && payment.userId.email.toLowerCase().includes(searchLower))
      );
    }
    
    return true;
  });
  
  // Group members by year
  const groupedMembers = filteredMembers.reduce((groups, payment) => {
    const year = payment.userId.year || 'Unknown';
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(payment);
    return groups;
  }, {});
  
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sortedYears = years.filter(year => groupedMembers[year] && groupedMembers[year].length > 0);
  
  // Add Unknown year if exists
  if (groupedMembers['Unknown'] && groupedMembers['Unknown'].length > 0) {
    sortedYears.push('Unknown');
  }
  
  // Calculate statistics
  const totalMembers = filteredMembers.length;
  const paidCount = filteredMembers.filter(m => m.status === 'Paid').length;
  const pendingCount = filteredMembers.filter(m => m.status === 'Pending').length;
  const failedCount = filteredMembers.filter(m => m.status === 'Failed').length;
  const notCreatedCount = filteredMembers.filter(m => m.status === 'Not Created').length;
  const totalCollected = filteredMembers
    .filter(m => m.status === 'Paid')
    .reduce((sum, m) => sum + m.amount, 0);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/treasurer-dashboard')}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-4xl font-bold">Members List by Month</h1>
                <p className="text-blue-100 mt-1">
                  View and manage monthly payment records
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center transition shadow-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Create Monthly Records
              </button>
              <button
                onClick={handleDownloadCSV}
                disabled={filteredMembers.length === 0}
                className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 font-semibold flex items-center transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5 mr-2" />
                Download CSV
              </button>
            </div>
          </div>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-center space-x-4 mb-6">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <div className="flex items-center space-x-3 bg-white bg-opacity-20 px-8 py-3 rounded-lg backdrop-blur-sm">
              <Calendar className="w-7 h-7" />
              <span className="text-2xl font-bold">{monthName} {yearNumber}</span>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
          
          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, USN, or email..."
                className="w-full pl-12 pr-4 py-3 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 backdrop-blur-sm text-white placeholder-white/60"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-wrap gap-4">
              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white/90">Status:</span>
                <div className="flex space-x-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'paid', label: 'Paid' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'failed', label: 'Failed' },
                    { value: 'not-created', label: 'Not Created' }
                  ].map(status => (
                    <button
                      key={status.value}
                      onClick={() => setStatusFilter(status.value)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        statusFilter === status.value
                          ? 'bg-white text-blue-600 shadow-lg' 
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Year Filter */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-white/90">Year:</span>
                <select
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                  className="px-4 py-2 border border-white/30 rounded-lg focus:ring-2 focus:ring-white focus:border-transparent bg-white/10 backdrop-blur-sm text-white font-medium"
                >
                  <option value="all" className="text-gray-900">All Years</option>
                  <option value="1st Year" className="text-gray-900">1st Year</option>
                  <option value="2nd Year" className="text-gray-900">2nd Year</option>
                  <option value="3rd Year" className="text-gray-900">3rd Year</option>
                  <option value="4th Year" className="text-gray-900">4th Year</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
            <p className="text-gray-500">
              No payment records match your filters for {monthName} {yearNumber}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Display year by year */}
            {sortedYears.map(year => (
              <div key={year} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Year Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">{year}</h2>
                    <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm font-semibold backdrop-blur-sm">
                      {groupedMembers[year].length} member{groupedMembers[year].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">USN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {groupedMembers[year].map((payment, index) => (
                        <tr key={payment._id || payment.userId._id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {payment.userId.profilePhoto ? (
                                <img
                                  src={payment.userId.profilePhoto}
                                  alt={payment.userId.name}
                                  className="w-8 h-8 rounded-full mr-3 object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                                  <Users className="w-4 h-4 text-gray-500" />
                                </div>
                              )}
                              <div className="text-sm font-medium text-gray-900">
                                {payment.userId.name}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.userId.usn}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.userId.branch}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              payment.status === 'Paid' 
                                ? 'bg-green-100 text-green-800' 
                                : payment.status === 'Pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : payment.status === 'Failed'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {payment.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                            {payment.status === 'Paid' ? `₹${payment.amount}` : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.paymentDate 
                              ? new Date(payment.paymentDate).toLocaleDateString('en-IN')
                              : '-'
                            }
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            {payment.status === 'Pending' && payment._id && !payment.paymentProof && (
                              <button
                                onClick={() => handleMarkPaid(payment)}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center transition"
                              >
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Mark Paid
                              </button>
                            )}
                            {payment.status === 'Pending' && payment._id && payment.paymentProof && (
                              <span className="text-sm text-yellow-700">Pending (awaiting verification)</span>
                            )}
                            {payment.status === 'Not Created' && (
                              <span className="text-gray-500 text-xs">No payment record</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Monthly Records Modal */}
      {showCreateModal && (
        <CreateMonthlyRecordsModal
          month={monthName}
          year={yearNumber}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateMonthlyRecords}
          loading={creatingRecords}
        />
      )}
    </div>
  );
};

// Create Monthly Records Modal Component
const CreateMonthlyRecordsModal = ({ month, year, onClose, onSubmit, loading }) => {
  const [amount, setAmount] = useState('100');
  const [deadline, setDeadline] = useState('');

  // Set default deadline to 5th of the month
  useEffect(() => {
    const defaultDeadline = new Date(year, new Date(`${month} 1, ${year}`).getMonth(), 5);
    setDeadline(defaultDeadline.toISOString().split('T')[0]);
  }, [month, year]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || !deadline) {
      toast.error('Please fill all fields');
      return;
    }
    onSubmit(amount, deadline);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Create Monthly Records</h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 font-medium mb-2">
            Creating records for: <span className="font-bold">{month} {year}</span>
          </p>
          <p className="text-xs text-blue-700">
            This will create payment records for ALL members with status "Pending".
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount (₹) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="1"
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Enter amount"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Deadline <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Records cannot be created if they already exist for this month.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Create Records
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MembersByMonthPage;
