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

  useEffect(() => {
    fetchPayments();
    const handleVisibilityChange = () => {
      if (!document.hidden) fetchPayments(false);
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchPayments = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

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

  const handleDownloadProof = async (paymentId) => {
    try {
      const response = await groupFundAPI.downloadProof(paymentId);
      if (response.success && response.data.paymentProofUrl) {
        window.open(response.data.paymentProofUrl, '_blank');
      } else {
        toast.error('Payment proof not found');
      }
    } catch (error) {
      console.error('Error downloading proof:', error);
      toast.error('Failed to download payment proof');
    }
  };

  const handlePaymentSuccess = () => {
    fetchPayments(false);
  };

  const handleRefresh = () => {
    fetchPayments(false);
    toast.success('Payment data refreshed');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    // Apply custom class for the 3D animated background
    <div className="min-h-screen relative dashboard-3d-bg text-[#F5F3E7] overflow-hidden">
      {/* Header */}
      <header className="bg-[#23261F] shadow-md sticky top-0 z-40 border-b border-[#3A3E36]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#A6C36F] rounded-lg flex items-center justify-center">
                <Wallet className="w-6 h-6 text-[#0B0B09]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#A6C36F]">
                  Member Dashboard
                </h1>
                <p className="text-sm text-[#E8E3C5]">Welcome back, {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-[#E8E3C5] hover:text-[#A6C36F] hover:bg-[#1F221C] rounded-lg transition-all disabled:opacity-50 border border-transparent hover:border-[#3A3E36]"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-[#E8E3C5] hover:text-[#A6C36F] hover:bg-[#1F221C] rounded-lg border border-transparent hover:border-[#3A3E36] transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - wrapped in a div to allow background to be beneath it */}
      <div className="relative z-10"> {/* Ensure content is above the animated background */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-[#3A3E36] border-t-[#A6C36F] rounded-full animate-spin mx-auto"></div>
                <p className="text-[#E8E3C5] font-medium">Loading dashboard...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PaymentSummaryCard totalPaid={summary.totalPaid} />
                <MemberInfoCard user={user} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-[#1F221C] rounded-xl shadow-md p-4 border-l-4 border-[#A6C36F]">
                  <p className="text-sm text-[#E8E3C5] font-medium">Paid Payments</p>
                  <p className="text-2xl font-bold text-[#A6C36F]">
                    {payments.filter(p => p.status === 'Paid').length}
                  </p>
                </div>

                <div className="bg-[#1F221C] rounded-xl shadow-md p-4 border-l-4 border-yellow-500">
                  <p className="text-sm text-[#E8E3C5] font-medium">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-400">{summary.totalPending}</p>
                </div>

                <div className="bg-[#1F221C] rounded-xl shadow-md p-4 border-l-4 border-red-500">
                  <p className="text-sm text-[#E8E3C5] font-medium">Failed Payments</p>
                  <p className="text-2xl font-bold text-red-500">{summary.totalFailed}</p>
                </div>
              </div>

              <FailedPaymentsSection />

              <PaymentHistoryTable
                payments={payments}
                onDownload={handleDownloadProof}
              />

              <div className="flex justify-center">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center space-x-2 px-8 py-4 text-lg font-semibold text-[#0B0B09] bg-[#A6C36F] hover:bg-[#99B864] rounded-xl shadow-md transition-all transform hover:scale-105"
                >
                  <Plus className="w-6 h-6" />
                  <span>Pay Group Fund</span>
                </button>
              </div>

              <ReimbursementSection userData={user} />
            </div>
          )}
        </main>
      </div> {/* End of z-10 content wrapper */}

      <PayGroupFundModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />

      {/* ANIMATED DEEP BLACK 3D BACKGROUND CSS */}
      <style>{`
        /* Fade In Animation */
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        /* Deep Black 3D Background */
        .dashboard-3d-bg {
          background-color: #000000; /* Truly deep black base */
          position: relative;
        }

        /* Overlay for subtle animated noise/stars */
        .dashboard-3d-bg::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: radial-gradient(circle at center, rgba(30, 30, 30, 0.1) 0%, rgba(0, 0, 0, 0.9) 80%);
          animation: radialShift 60s linear infinite alternate;
          opacity: 0.7;
          z-index: 1; /* Ensure this is behind the content but above the base background */
        }
        
        /* Another layer for moving particles/stars */
        .dashboard-3d-bg::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: 
                url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5orgv0MDAvL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgOCA4IiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA4IDg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+Cgkuc3Qwe2ZpbGw6IzAwMDAwMDt9Cgkuc3Qxe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU+DQo8cmVjdCBjbGFzcz0ic3QwIiB3aWR0aD0iOCIgaGVpZ2h0PSI4Ii8+DQo8Y2lyY2xlIGNsYXNzPSJzdDEiIGN4PSIxLjUiIGN5PSIxLjUiIHI9IjAuNSIvPg0KPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iNi41IiBjeT0iMS41IiByPSIwLjUiLz4NCjxjaXJjbGUgY2xhc3M9InN0MSIgY3g9IjEuNSIgY3k9IjYuNSIgci攻撃IjAuNSIvPg0KPGNpcmNsZSBjbGFzcz0ic3QxIiBjeD0iNi41IiBjeT0iNi41IiByPSIwLjUiLz4NCjwvc3ZnPg==') repeat;
            background-size: 200px 200px; /* Adjust size for perceived depth */
            animation: moveBackground 120s linear infinite; /* Slower movement */
            opacity: 0.05; /* Very subtle dots/stars */
            z-index: 0; /* Behind everything else */
        }


        @keyframes radialShift {
          0% {
            transform: scale(1) translate(0, 0);
            opacity: 0.7;
          }
          25% {
            transform: scale(1.1) translate(-10%, 5%);
            opacity: 0.8;
          }
          50% {
            transform: scale(1) translate(0, 0);
            opacity: 0.7;
          }
          75% {
            transform: scale(0.9) translate(10%, -5%);
            opacity: 0.6;
          }
          100% {
            transform: scale(1) translate(0, 0);
            opacity: 0.7;
          }
        }

        @keyframes moveBackground {
            from { background-position: 0 0; }
            to { background-position: 100% 100%; }
        }
      `}</style>
    </div>
  );
};

export default MemberDashboard;