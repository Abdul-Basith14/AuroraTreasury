import { useState, useEffect } from 'react';
import { LogOut, Wallet, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { groupFundAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import PaymentSummaryCard from './PaymentSummaryCard';
import MemberInfoCard from './MemberInfoCard';
import PaymentHistoryTable from './PaymentHistoryTable';
import PayGroupFundModal from './PayGroupFundModal';
import ReimbursementSection from './ReimbursementSection';
import FailedPaymentsSection from './FailedPaymentsSection';

/**
 * MemberDashboard Component
 * Main dashboard for club members to manage group fund payments
 */
const MemberDashboard = () => {
  const { user, logout } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPending: 0,
    totalFailed: 0,
    totalRecords: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch payment data on component mount
  useEffect(() => {
    fetchPayments();
    
    // Refresh payments when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchPayments(false); // Refresh without showing loader
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  /**
   * Fetch all payment records for the logged-in user
   */
  const fetchPayments = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const response = await groupFundAPI.getMyPayments();
      
      if (response.success) {
        setPayments(response.data.payments || []);
        setSummary(response.data.summary || {
          totalPaid: 0,
          totalPending: 0,
          totalFailed: 0,
          totalRecords: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payment records');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Handle payment proof download
   */
  const handleDownloadProof = async (paymentId) => {
    try {
      const response = await groupFundAPI.downloadProof(paymentId);
      
      if (response.success && response.data.paymentProofUrl) {
        // Open in new tab
        window.open(response.data.paymentProofUrl, '_blank');
      } else {
        toast.error('Payment proof not found');
      }
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Failed to download payment proof');
    }
  };

  /**
   * Handle successful payment submission
   */
  const handlePaymentSuccess = () => {
    fetchPayments(false); // Refresh without full page loader
  };

  /**
   * Handle refresh button click
   */
  const handleRefresh = () => {
    fetchPayments(false);
    toast.success('Payment data refreshed');
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Member Dashboard
                </h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}!</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-3">
              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading State
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-fadeIn">
            {/* Top Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Summary Card */}
              <PaymentSummaryCard totalPaid={summary.totalPaid} />

              {/* Member Info Card */}
              <MemberInfoCard user={user} />
            </div>

            {/* Payment Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Paid Count */}
              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
                <p className="text-sm text-gray-600 font-medium">Paid Payments</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(p => p.status === 'Paid').length}
                </p>
              </div>

              {/* Pending Count */}
              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-600 font-medium">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.totalPending}</p>
              </div>

              {/* Failed Count */}
              <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
                <p className="text-sm text-gray-600 font-medium">Failed Payments</p>
                <p className="text-2xl font-bold text-red-600">{summary.totalFailed}</p>
              </div>
            </div>

            {/* Failed Payments Section - Shows ONLY if there are failed payments */}
            <FailedPaymentsSection />

            {/* Payment History Table */}
            <PaymentHistoryTable
              payments={payments}
              onDownload={handleDownloadProof}
            />

            {/* Pay Group Fund Button */}
            <div className="flex justify-center">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                <Plus className="w-6 h-6" />
                <span>Pay Group Fund</span>
              </button>
            </div>

            {/* Reimbursement Section */}
            <ReimbursementSection userData={user} />
          </div>
        )}
      </main>

      {/* Payment Modal */}
      <PayGroupFundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* Custom CSS for fade-in animation */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MemberDashboard;
