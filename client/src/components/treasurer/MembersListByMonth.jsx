import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMonthBasedMemberList, deleteMonthlyRecords } from '../../utils/treasurerAPI';
import { Download, Trash2, Calendar, Users, IndianRupee, CheckCircle, Clock, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Month-based Member List Component
 * Shows payment status for all members in a specific month (table view)
 */
const MembersListByMonth = () => {
  const [memberList, setMemberList] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Get current month and year
  useEffect(() => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear().toString();
    setSelectedMonth(month);
    setSelectedYear(year);
  }, []);
  
  // Fetch member list when month/year changes
  useEffect(() => {
    if (selectedMonth && selectedYear) {
      fetchMemberList();
    }
    
    // Auto-refresh when page becomes visible
    const handleVisibilityChange = () => {
      if (!document.hidden && selectedMonth && selectedYear) {
        fetchMemberList();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedMonth, selectedYear]);
  
  /**
   * Fetch member list for selected month
   */
  const fetchMemberList = async () => {
    setLoading(true);
    try {
      const data = await getMonthBasedMemberList(selectedMonth, selectedYear);
      setMemberList(data.members || []);
      setSummary(data.summary);
    } catch (error) {
      toast.error('Failed to load member list');
      console.error('Fetch member list error:', error);
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
        <div className="flex items-center justify-center space-x-4">
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
      </div>
      
      {/* Summary Cards */}
      {summary && (
        <div className="p-6 border-b border-gray-200">
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
        ) : memberList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p>No members found</p>
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {memberList.map((member, index) => (
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
    </div>
  );
};

export default MembersListByMonth;
