import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { AlertCircle, RefreshCw, Download, Calendar, Search, Loader2, DollarSign, Users, X, Clock } from 'lucide-react';

// --- Dark Olive Theme Colors ---
const PRIMARY_BG = '#1C1E18'; // Very dark green/gray (Main background)
const HEADER_BG = '#252820'; // Slightly lighter dark BG (Component background)
const CARD_BG = '#2F332A'; // Darker card background
const ACCENT_OLIVE = '#8D9F6C'; // Rich, slightly darker olive for primary action
const ACCENT_HOVER = '#7A8B5B';
const TEXT_LIGHT = '#E8E3C5'; // Light text
const TEXT_MUTED = '#A6A699'; // Muted Light Text
const BORDER_DARK = '#3D4034'; // Dark border/divider
const DANGER_RED = '#DC2626'; // Red for caution/remove actions
const SUCCESS_GREEN = '#10B981'; // Green for success/add actions
const ALERT_YELLOW = '#FBBF24'; // Yellow for pending
const ALERT_ORANGE = '#F97316'; // Orange for quick action button

// --- Mock Hooks & API (For Single File Execution) ---

// Mocking useNavigate from react-router-dom
const mockNavigate = (path) => console.log(`MOCK NAVIGATION: Attempted to navigate to: ${path}`);
const useNavigate = () => mockNavigate;

// Mock Data
const mockStatistics = {
  totalMembers: 452,
  paidMembers: 398,
  pendingPayments: 44,
  failedPayments: 10,
  totalRevenue: 556000,
  membersByYear: [
    { year: 2024, count: 120 },
    { year: 2025, count: 180 },
    { year: 2026, count: 152 },
  ],
};

const mockMembers = [
    { id: 1, name: 'Alice Johnson', usn: '1A21CS001', year: 2025, branch: 'CS', email: 'alice@example.com', totalPaid: 15000, stats: { paidCount: 12, pendingCount: 0, failedCount: 0 }, overallStatus: 'paid' },
    { id: 2, name: 'Bob Williams', usn: '1A21EC005', year: 2024, branch: 'EC', email: 'bob@example.com', totalPaid: 10000, stats: { paidCount: 8, pendingCount: 1, failedCount: 1 }, overallStatus: 'failed' },
    { id: 3, name: 'Charlie Brown', usn: '1A21IS010', year: 2026, branch: 'IS', email: 'charlie@example.com', totalPaid: 5000, stats: { paidCount: 5, pendingCount: 4, failedCount: 0 }, overallStatus: 'pending' },
    { id: 4, name: 'David Smith', usn: '1A21ME015', year: 2025, branch: 'ME', email: 'david@example.com', totalPaid: 15000, stats: { paidCount: 12, pendingCount: 0, failedCount: 0 }, overallStatus: 'paid' },
    { id: 5, name: 'Eve Davis', usn: '1A21CE020', year: 2024, branch: 'CE', email: 'eve@example.com', totalPaid: 5000, stats: { paidCount: 5, pendingCount: 4, failedCount: 0 }, overallStatus: 'pending' },
];

const simulateDelay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms));

const getStatistics = async () => {
  await simulateDelay();
  return { statistics: mockStatistics };
};

const getMembers = async (params) => {
  await simulateDelay();
  let filteredMembers = mockMembers;
  
  // Apply Year Filter
  if (params.year !== 'all') {
    filteredMembers = filteredMembers.filter(m => m.year.toString() === params.year.toString());
  }

  // Apply Status Filter
  if (params.status !== 'all') {
    filteredMembers = filteredMembers.filter(m => m.overallStatus === params.status);
  }

  // Apply Search Filter
  if (params.search) {
    const query = params.search.toLowerCase();
    filteredMembers = filteredMembers.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.usn.toLowerCase().includes(query)
    );
  }
  return { members: filteredMembers };
};

// --- Mock Sub-Components (Styled for Olive Theme) ---

const DashboardStats = ({ statistics, loading, onViewFailedPayments }) => {
  const Card = ({ title, value, icon: Icon, colorClass, loading }) => (
    <div className={`bg-[${CARD_BG}] p-6 rounded-xl shadow-lg border border-[${BORDER_DARK}] flex flex-col justify-between h-full`}>
      <div className="flex items-center justify-between">
        <Icon className={`w-8 h-8 ${colorClass} opacity-80`} />
        <p className={`text-sm font-medium uppercase tracking-wider text-[${TEXT_MUTED}]`}>{title}</p>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-10 bg-[${BORDER_DARK}] rounded w-3/4 animate-pulse"></div>
        ) : (
          <p className="text-3xl font-bold text-[${TEXT_LIGHT}]">
            {value}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card 
        title="Total Members" 
        value={statistics?.totalMembers || 'N/A'} 
        icon={Users} 
        colorClass={`text-[${ACCENT_OLIVE}]`} 
        loading={loading}
      />
      <Card 
        title="Total Revenue (₹)" 
        value={statistics?.totalRevenue?.toLocaleString('en-IN') || 'N/A'} 
        icon={DollarSign} 
        colorClass={`text-[${SUCCESS_GREEN}]`} 
        loading={loading}
      />
      <Card 
        title="Pending Payments" 
        value={statistics?.pendingPayments || 'N/A'} 
        icon={Clock} 
        colorClass={`text-[${ALERT_YELLOW}]`} 
        loading={loading}
      />
      <div onClick={onViewFailedPayments} className="cursor-pointer">
        <Card 
          title="Failed Payments" 
          value={statistics?.failedPayments || 'N/A'} 
          icon={AlertCircle} 
          colorClass={`text-[${DANGER_RED}]`} 
          loading={loading}
        />
      </div>
    </div>
  );
};

const MembersListSection = ({ members, loading, selectedYear, selectedStatus, refreshMembers }) => {
  const getStatusChip = (status) => {
    switch (status) {
      case 'paid':
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-[${SUCCESS_GREEN}]/20 text-[${SUCCESS_GREEN}]`}>Good Standing</span>;
      case 'pending':
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-[${ALERT_YELLOW}]/20 text-[${ALERT_YELLOW}]`}>Pending Fee</span>;
      case 'failed':
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-[${DANGER_RED}]/20 text-[${DANGER_RED}]`}>Payment Failed</span>;
      default:
        return <span className={`px-3 py-1 text-xs font-semibold rounded-full bg-[${TEXT_MUTED}]/20 text-[${TEXT_MUTED}]`}>N/A</span>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-xl font-semibold text-[${TEXT_LIGHT}]`}>
          Showing {members.length} Result{members.length !== 1 ? 's' : ''}
          {selectedYear !== 'all' && ` for Year ${selectedYear}`}
          {selectedStatus !== 'all' && ` (Status: ${selectedStatus})`}
        </h3>
        <button
          onClick={refreshMembers}
          className={`p-2 rounded-full bg-[${ACCENT_OLIVE}]/20 text-[${ACCENT_OLIVE}] hover:bg-[${ACCENT_OLIVE}]/30 transition-colors`}
          disabled={loading}
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className={`text-center py-12 text-[${TEXT_MUTED}]`}>
          <Loader2 className="w-8 h-8 mx-auto mb-3 animate-spin text-[${ACCENT_OLIVE}]" />
          <p>Loading members...</p>
        </div>
      ) : members.length === 0 ? (
        <div className={`text-center py-12 text-[${TEXT_MUTED}]`}>
          <AlertCircle className="w-10 h-10 mx-auto mb-3" />
          <p>No members found matching the current filters.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div 
              key={member.id} 
              className={`flex justify-between items-center p-4 rounded-lg bg-[${CARD_BG}] hover:bg-[${CARD_BG}]/70 border border-[${BORDER_DARK}] transition-colors duration-200`}
            >
              <div className="min-w-0 flex-1 pr-4">
                <p className={`font-bold text-[${TEXT_LIGHT}] truncate`}>{member.name}</p>
                <p className={`text-sm text-[${TEXT_MUTED}]`}>{member.usn} | {member.branch} ({member.year})</p>
              </div>
              <div className="flex flex-col items-end sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <p className={`font-semibold text-[${TEXT_LIGHT}]`}>₹ {member.totalPaid.toLocaleString('en-IN')}</p>
                {getStatusChip(member.overallStatus)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const YearFilterTabs = ({ selectedYear, onYearChange, membersByYear }) => {
  // Extract all unique years, ensuring 'all' is always present
  const years = ['all', ...membersByYear.map(m => m.year.toString()).sort().reverse()];

  return (
    <div className={`px-6 pt-4 border-b border-[${BORDER_DARK}] overflow-x-auto`}>
      <div className="flex space-x-2 pb-2 min-w-max">
        {years.map(year => {
          const countData = membersByYear.find(m => m.year.toString() === year);
          const count = countData ? countData.count : mockStatistics.totalMembers;
          return (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${
                selectedYear === year
                  ? `bg-[${ACCENT_OLIVE}] text-[${PRIMARY_BG}] shadow-md`
                  : `bg-[${CARD_BG}] text-[${TEXT_MUTED}] hover:bg-[${BORDER_DARK}]`
              }`}
            >
              {year === 'all' ? 'All Years' : `Year ${year}`}
              {year !== 'all' && <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-black/20 text-white">{count}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(query);
    }
  };

  return (
    <div className="relative">
      <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[${TEXT_MUTED}]`} />
      <input
        type="text"
        placeholder="Search by Name or USN..."
        value={query}
        onChange={(e) => {
            setQuery(e.target.value);
            // Optionally, search immediately after a delay
            setTimeout(() => onSearch(e.target.value), 500);
        }}
        onKeyDown={handleKeyDown}
        className={`w-full py-2 pl-10 pr-4 bg-[${CARD_BG}] border border-[${BORDER_DARK}] rounded-lg text-[${TEXT_LIGHT}] placeholder-[${TEXT_MUTED}] focus:border-[${ACCENT_OLIVE}] focus:ring-1 focus:ring-[${ACCENT_OLIVE}] outline-none transition-colors duration-200`}
      />
    </div>
  );
};

const FailedPaymentsQuickView = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    // Mock data for the quick view
    const failedPaymentsData = [
        { id: 1, name: 'Bob Williams', usn: '1A21EC005', amount: 500, date: '2025-10-15' },
        { id: 2, name: 'Jane Doe', usn: '1A21CS030', amount: 1200, date: '2025-09-22' },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className={`bg-[${HEADER_BG}] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[${BORDER_DARK}]`}>
                <div className="flex justify-between items-center mb-4 border-b border-[${BORDER_DARK}] pb-3">
                    <h3 className={`text-2xl font-bold text-[${TEXT_LIGHT}] flex items-center`}>
                        <AlertCircle className={`w-6 h-6 mr-2 text-[${DANGER_RED}]`} />
                        Failed Payments Summary
                    </h3>
                    <button onClick={onClose} className={`text-[${TEXT_MUTED}] hover:text-[${TEXT_LIGHT}]`}>
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {failedPaymentsData.length > 0 ? (
                        failedPaymentsData.map(payment => (
                            <div key={payment.id} className={`p-4 rounded-lg bg-[${CARD_BG}] border border-[${BORDER_DARK}] flex justify-between items-center`}>
                                <div>
                                    <p className={`font-semibold text-[${TEXT_LIGHT}]`}>{payment.name} ({payment.usn})</p>
                                    <p className={`text-sm text-[${TEXT_MUTED}]`}>Failed on {payment.date}</p>
                                </div>
                                <p className={`font-bold text-lg text-[${DANGER_RED}]`}>- ₹{payment.amount.toLocaleString('en-IN')}</p>
                            </div>
                        ))
                    ) : (
                        <p className={`text-center py-8 text-[${TEXT_MUTED}]`}>No recent failed payments recorded.</p>
                    )}
                </div>
            </div>
        </div>
    );
};


/**
 * Treasurer Dashboard Component
 * Main dashboard for treasurers to manage and view all members (Dark Olive Theme)
 */
const TreasurerDashboard = () => {
  const navigate = useNavigate(); // Mocked
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
  }, []);
  
  // Fetch members when filters change
  useEffect(() => {
    fetchMembers();
  }, [selectedYear, selectedStatus, searchQuery]);
  
  /**
   * Fetch dashboard statistics (uses mock API)
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
   * Fetch members with current filters (uses mock API)
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
   * NOTE: This is a standard browser implementation and does not require an external API.
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
    <div className={`min-h-screen bg-[${PRIMARY_BG}] text-[${TEXT_LIGHT}] font-sans`}>
      {/* Header */}
      <div className={`bg-gradient-to-r from-[${ACCENT_OLIVE}] to-[#4E5244] text-white py-8 px-6 shadow-xl`}>
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Treasurer Dashboard</h1>
          <p className="text-white/80">Manage AuroraTreasury club finances and member statuses</p>
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
            className={`px-6 py-3 bg-[${ACCENT_OLIVE}] text-[${PRIMARY_BG}] rounded-lg hover:bg-[${ACCENT_HOVER}] font-semibold shadow-md transition-all duration-200 flex items-center`}
          >
            <Calendar className="w-5 h-5 mr-2" />
            Members by Month
          </button>
          
          <button
            onClick={handleViewFailedPayments}
            className={`px-6 py-3 bg-[${DANGER_RED}] text-[${TEXT_LIGHT}] rounded-lg hover:bg-red-700 font-semibold shadow-md transition-all duration-200 flex items-center`}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            View Failed Payments
          </button>
          
          <button
            onClick={handleResetFilters}
            className={`px-6 py-3 bg-[${CARD_BG}] border border-[${BORDER_DARK}] text-[${TEXT_LIGHT}] rounded-lg hover:bg-[${BORDER_DARK}] font-semibold transition-all duration-200 flex items-center`}
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Reset Filters
          </button>
          
          <button
            onClick={() => setShowFailedPaymentsView(true)}
            className={`px-6 py-3 bg-[${ALERT_ORANGE}] text-white rounded-lg hover:bg-orange-700 font-semibold shadow-md transition-all duration-200 flex items-center`}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Summary Modal
          </button>
        </div>
        
        {/* Members List Section */}
        <div id="members-list" className={`bg-[${HEADER_BG}] rounded-2xl shadow-xl border border-[${BORDER_DARK}]`}>
          {/* Header & Search */}
          <div className="p-6 border-b border-[${BORDER_DARK}]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
              <h2 className={`text-2xl font-bold text-[${TEXT_LIGHT}]`}>Members List</h2>
              <button 
                onClick={handleExport}
                className={`px-4 py-2 bg-[${SUCCESS_GREEN}] text-[${PRIMARY_BG}] rounded-lg hover:bg-green-700 font-medium flex items-center transition-colors duration-200`}
              >
                <Download className="w-5 h-5 mr-2" />
                Export CSV
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
          <div className={`px-6 py-4 border-b border-[${BORDER_DARK}]`}>
            <div className="flex items-center space-x-3 flex-wrap">
              <span className={`text-sm font-medium text-[${TEXT_MUTED}]`}>Status:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'All', color: TEXT_MUTED },
                  { value: 'paid', label: 'Paid', color: SUCCESS_GREEN },
                  { value: 'pending', label: 'Pending', color: ALERT_YELLOW },
                  { value: 'failed', label: 'Failed', color: DANGER_RED }
                ].map(status => (
                  <button
                    key={status.value}
                    onClick={() => handleStatusChange(status.value)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
                      selectedStatus === status.value
                        ? `bg-[${status.color}] text-[${PRIMARY_BG}] border-[${status.color}]`
                        : `bg-[${CARD_BG}] text-[${status.color}] border-[${BORDER_DARK}] hover:bg-[${BORDER_DARK}]`
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