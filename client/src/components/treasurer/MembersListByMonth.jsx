import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMonthBasedMemberList, deleteMonthlyRecords } from '../../utils/treasurerAPI';
import { Download, Calendar, Users, CheckCircle, ChevronLeft, ChevronRight, Search, Trash2 } from 'lucide-react';
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
  const [showManualUpdateModal, setShowManualUpdateModal] = useState(false);
  const [selectedMemberForUpdate, setSelectedMemberForUpdate] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get current month and year and fetch club settings
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
        email: member.userId?.email || member.email || 'N/A',
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
    * Handle manual payment update
    */
  const handleManualUpdate = (member) => {
    const defaultAmount = member.amount > 0 ? member.amount : 100;
    
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
    * Get status badge color (Themed)
    */
  const getStatusBadge = (status) => {
    const configs = {
      // Paid: Olive Accent
      'Paid': 'bg-[#A6C36F]/10 text-[#A6C36F] border-[#A6C36F]/40',
      // Pending: Yellow/Muted
      'Pending': 'bg-yellow-800/20 text-yellow-400 border-yellow-700/50',
      // Failed/Error: Red/Alert
      'Failed': 'bg-red-800/20 text-red-400 border-red-700/50',
      // Not Created: Muted Gray
      'Not Created': 'bg-[#3A3E36]/40 text-[#E8E3C5]/70 border-[#3A3E36]/70'
    };
    return configs[status] || configs['Not Created'];
  };
  
  return (
    // Outer container: Dark Panel style
    <div className="bg-black/60 backdrop-blur-xl rounded-2xl shadow-[0_0_25px_rgba(166,195,111,0.08)] border border-[#A6C36F]/20">
      
      {/* Header & Actions */}
      <div className="p-6 border-b border-[#A6C36F]/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#F5F3E7]">Members List by Month</h2>
          
          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              disabled={memberList.length === 0}
              className="flex items-center px-4 py-2 bg-black/40 text-[#F5F3E7] rounded-lg hover:bg-[#A6C36F]/10 font-medium transition-colors duration-200 disabled:opacity-50 border border-[#A6C36F]/20"
            >
              <Download className="w-5 h-5 mr-2" />
              Download CSV
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={memberList.length === 0}
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
            className="p-2 hover:bg-[#A6C36F]/10 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="w-6 h-6 text-[#E8E3C5]" />
          </button>
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-[#A6C36F]" />
            <span className="text-xl font-bold text-[#F5F3E7]">
              {selectedMonth} {selectedYear}
            </span>
          </div>
          <button
            onClick={handleNextMonth}
            className="p-2 hover:bg-[#A6C36F]/10 rounded-lg transition-colors duration-200"
          >
            <ChevronRight className="w-6 h-6 text-[#E8E3C5]" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#A6C36F]/70" />
          <input
            type="text"
            placeholder="Search by name, USN, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 
              border border-[#A6C36F]/20 rounded-xl 
              bg-black/40 text-[#F5F3E7] 
              placeholder:text-[#E8E3C5]/60
              focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E8E3C5]/60 hover:text-[#E8E3C5]"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      {/* Summary (CLEANED UP SECTION) */}
      {summary && searchQuery && (
        <div className="p-6 border-b border-[#A6C36F]/20">
            <div className="text-sm text-[#E8E3C5]/70">
              Showing <span className="font-semibold text-[#A6C36F]">{filteredMembers.length}</span> of <span className="font-semibold">{summary.totalMembers}</span> members
            </div>
        </div>
      )}
      
      {/* Member List Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6C36F]"></div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 text-[#A6C36F]/20" />
            <p className="text-[#E8E3C5]/80">{searchQuery ? `No members found matching "${searchQuery}"` : 'No members found'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-black/40 border-b border-[#A6C36F]/20">
              <tr>
                {['#', 'Name', 'USN', 'Year', 'Branch', 'Status', 'Amount', 'Payment Date', 'Actions'].map(header => (
                  <th key={header} className={`px-6 py-3 text-left text-xs font-medium text-[#E8E3C5]/70 uppercase tracking-wider ${header === 'Actions' ? 'text-center' : ''}`}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#A6C36F]/10">
              {filteredMembers.map((member, index) => (
                <tr key={member._id || index} className="hover:bg-[#A6C36F]/5 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/70">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#F5F3E7]">{member.name}</div>
                    <div className="text-xs text-[#E8E3C5]/60">{member.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/80">{member.usn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/80">{member.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/80">{member.branch}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(member.paymentStatus)}`}>
                      {member.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/80">
                    {typeof member.amount === 'number' ? `INR ${member.amount.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#E8E3C5]/80">
                    {member.paymentDate ? new Date(member.paymentDate).toLocaleDateString('en-IN') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {member.paymentStatus === 'Pending' && !member.paymentProof ? (
                      <button
                        onClick={() => handleManualUpdate(member)}
                        className="inline-flex items-center px-3 py-1.5 bg-[#A6C36F] text-black text-xs font-medium rounded-lg hover:bg-[#8FAE5D] transition-colors duration-200"
                        title="Mark as paid (for cash/offline payments)"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Mark Paid
                      </button>
                    ) : member.paymentStatus === 'Pending' && member.paymentProof ? (
                      <span className="text-sm text-yellow-400">Pending (awaiting verification)</span>
                    ) : member.paymentStatus === 'Paid' ? (
                      <span className="text-[#A6C36F] text-xs font-medium">✓ Paid</span>
                    ) : (
                      <span className="text-[#E8E3C5]/50 text-xs">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F120D] border border-[#A6C36F]/30 rounded-xl shadow-xl w-full max-w-md p-6 text-left">
            <div className="flex items-start space-x-3 mb-4">
              <div className="p-3 bg-red-900/30 rounded-lg border border-red-700/40">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#F5F3E7]">Delete monthly records?</h3>
                <p className="text-sm text-[#E8E3C5]/70 mt-1">
                  This removes all payment records for <span className="font-semibold text-[#F5F3E7]">{selectedMonth} {selectedYear}</span>. You can recreate the month later, but this action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-black/40 text-[#E8E3C5] rounded-lg hover:bg-[#A6C36F]/10 font-medium transition-colors duration-200 border border-[#A6C36F]/20"
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
      )}
      
      {/* Manual Payment Update Modal (Assumes ManualPaymentUpdateModal is themed separately) */}
      {showManualUpdateModal && selectedMemberForUpdate && (
        <ManualPaymentUpdateModal
          isOpen={showManualUpdateModal}
          onClose={() => setShowManualUpdateModal(false)}
          payment={selectedMemberForUpdate.payment}
          member={selectedMemberForUpdate.member}
          onSuccess={handleManualUpdateSuccess}
        />
      )}
    </div>
  );
};

export default MembersListByMonth;