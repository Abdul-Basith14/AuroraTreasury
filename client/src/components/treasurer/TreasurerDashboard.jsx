import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMembers, getStatistics } from '../../utils/treasurerAPI';
import { AlertCircle, RefreshCw, Download, Calendar } from 'lucide-react';
import DashboardStats from './DashboardStats';
import MembersListSection from './MembersListSection';
import YearFilterTabs from './YearFilterTabs';
import SearchBar from './SearchBar';
import FailedPaymentsQuickView from './FailedPaymentsQuickView';

/**
 * Treasurer Dashboard Component
 * Main dashboard for treasurers to manage and view all members
 */
const TreasurerDashboard = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showFailedPaymentsView, setShowFailedPaymentsView] = useState(false);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchStatistics();
    fetchMembers();
  }, []);
  
  // Fetch members when filters change
  useEffect(() => {
    fetchMembers();
  }, [selectedYear, selectedStatus, searchQuery]);
  
  /**
   * Fetch dashboard statistics
   */
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const data = await getStatistics();
      setStatistics(data.statistics);
    } catch (error) {
      toast.error('Failed to load statistics');
      console.error('Error fetching statistics:', error);
    } finally {
      setStatsLoading(false);
    }
  };
  
  /**
   * Fetch members with current filters
   */
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = {
        year: selectedYear,
        status: selectedStatus,
        search: searchQuery
      };
      const data = await getMembers(params);
      setMembers(data.members || []);
    } catch (error) {
      toast.error('Failed to load members');
      console.error('Error fetching members:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle year filter change
   */
  const handleYearChange = (year) => {
    setSelectedYear(year);
  };
  
  /**
   * Handle status filter change
   */
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };
  
  /**
   * Handle search query
   */
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  /**
   * View failed payments - set status filter and scroll
   */
  const handleViewFailedPayments = () => {
    setSelectedStatus('failed');
    // Scroll to members list
    setTimeout(() => {
      document.getElementById('members-list')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };
  
  /**
   * Reset all filters
   */
  const handleResetFilters = () => {
    setSelectedYear('all');
    setSelectedStatus('all');
    setSearchQuery('');
  };
  
  /**
   * Export members data to CSV
   */
  const handleExport = () => {
    try {
      // Prepare CSV data
      const csvData = [
        ['Name', 'USN', 'Year', 'Branch', 'Email', 'Total Paid', 'Paid Count', 'Pending Count', 'Failed Count', 'Status'],
        ...members.map(m => [
          m.name,
          m.usn,
          m.year,
          m.branch,
          m.email,
          m.totalPaid,
          m.stats.paidCount,
          m.stats.pendingCount,
          m.stats.failedCount,
          m.overallStatus
        ])
      ];
      
      // Convert to CSV string
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `members-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Members data exported successfully');
    } catch (error) {
      toast.error('Failed to export data');
      console.error('Export error:', error);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Treasurer Dashboard</h1>
          <p className="text-blue-100">Manage AuroraTreasury club finances</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Statistics Cards */}
        <DashboardStats 
          statistics={statistics} 
          loading={statsLoading}
          onViewFailedPayments={handleViewFailedPayments}
        />
        
        {/* Quick Actions Bar */}
        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => navigate('/treasurer/members-by-month')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Members by Month
          </button>
          
          <button
            onClick={handleViewFailedPayments}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            View All Failed Payments
          </button>
          
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all duration-200 flex items-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset Filters
          </button>
          
          <button
            onClick={() => setShowFailedPaymentsView(true)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Failed Payments Summary
          </button>
        </div>
        
        {/* Members List Section */}
        <div id="members-list" className="bg-white rounded-2xl shadow-lg">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Members List</h2>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center transition-colors duration-200"
              >
                <Download className="w-5 h-5 mr-2" />
                Export
              </button>
            </div>
            
            {/* Search Bar */}
            <SearchBar onSearch={handleSearch} />
          </div>
          
          {/* Year Filter Tabs */}
          <YearFilterTabs 
            selectedYear={selectedYear}
            onYearChange={handleYearChange}
            membersByYear={statistics?.membersByYear || []}
          />
          
          {/* Status Filter Chips */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3 flex-wrap">
              <span className="text-sm font-medium text-gray-700">Status:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', color: 'gray' },
                  { value: 'paid', label: 'Good', color: 'green' },
                  { value: 'pending', label: 'Pending', color: 'yellow' },
                  { value: 'failed', label: 'Failed', color: 'red' }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedStatus === status.value
                        ? status.color === 'gray'
                          ? 'bg-gray-600 text-white'
                          : status.color === 'green'
                          ? 'bg-green-600 text-white'
                          : status.color === 'yellow'
                          ? 'bg-yellow-600 text-white'
                          : 'bg-red-600 text-white'
                        : status.color === 'gray'
                        ? 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        : status.color === 'green'
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : status.color === 'yellow'
                        ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Members Grid */}
          <MembersListSection
            members={members}
            loading={loading}
            selectedYear={selectedYear}
            selectedStatus={selectedStatus}
            refreshMembers={fetchMembers}
          />
        </div>
      </div>
      
      {/* Failed Payments Quick View Modal */}
      <FailedPaymentsQuickView
        isOpen={showFailedPaymentsView}
        onClose={() => setShowFailedPaymentsView(false)}
      />
    </div>
  );
};

export default TreasurerDashboard;
