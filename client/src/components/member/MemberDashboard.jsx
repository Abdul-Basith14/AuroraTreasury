import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Wallet, Plus, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { groupFundAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import PaymentSummaryCard from './PaymentSummaryCard';
import MemberInfoCard from './MemberInfoCard';
import PaymentHistoryTable from './PaymentHistoryTable';
import QRPaymentModal from './QRPaymentModal';
import ReimbursementSection from './ReimbursementSection';
import FailedPaymentsSection from './FailedPaymentsSection';
import Background3D from '../Background3D';

/**
 * MemberDashboard Component
 * Main dashboard for club members to manage group fund payments
 */
const MemberDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState({
    totalPaid: 0,
    totalPaidAmount: 0,
    totalPending: 0,
    totalFailed: 0,
    totalRecords: 0,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecords, setActiveRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [openingPayment, setOpeningPayment] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchActiveRecords();
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
      const myPayments = response.payments || response.data?.payments || [];

      setPayments(myPayments);

      // Build summary locally to avoid shape mismatches
      const computed = myPayments.reduce(
        (acc, p) => {
          const amount = typeof p.amount === 'number' ? p.amount : Number(p.amount) || 0;
          if (p.status === 'Paid') {
            acc.totalPaid += 1;
            acc.totalPaidAmount += amount;
          } else if (p.status === 'Pending' || p.status === 'AwaitingVerification') {
            acc.totalPending += 1;
          } else if (p.status === 'Failed') {
            acc.totalFailed += 1;
          }
          acc.totalRecords += 1;
          return acc;
        },
        { totalPaid: 0, totalPaidAmount: 0, totalPending: 0, totalFailed: 0, totalRecords: 0 }
      );

      setSummary(computed);
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

  const fetchCurrentRecord = async () => {
    const response = await groupFundAPI.getCurrentRecord();
    if (response.success && response.recordExists) {
      setCurrentRecord(response.record);
      return response.record;
    }
    setCurrentRecord(null);
    return null;
  };

  const fetchActiveRecords = async () => {
    try {
      const response = await groupFundAPI.getActiveRecords();
      if (response.success && response.recordExists && Array.isArray(response.records)) {
        setActiveRecords(response.records);
        // Default selection to most recent
        setCurrentRecord(response.records[0]);
      } else {
        setActiveRecords([]);
        setCurrentRecord(null);
      }
    } catch (error) {
      console.error('Error fetching active records:', error);
      setActiveRecords([]);
      setCurrentRecord(null);
    }
  };

  const handleOpenPay = async () => {
    try {
      setOpeningPayment(true);
      await fetchActiveRecords();
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error opening payment modal:', err);
      toast.error(err?.message || 'Unable to start payment');
    } finally {
      setOpeningPayment(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen relative overflow-hidden font-inter text-[#F5F3E7]">
      <Background3D />
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/60 backdrop-blur-xl border-b border-[#A6C36F]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A6C36F] to-[#8FAE5D] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(166,195,111,0.3)]">
                <Wallet className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F5F3E7] tracking-tight">
                  Member Dashboard
                </h1>
                <p className="text-sm text-[#E8E3C5]/60">Welcome back, {user?.name}!</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-[#E8E3C5]/80 hover:text-[#A6C36F] hover:bg-[#A6C36F]/10 rounded-lg transition-all disabled:opacity-50 border border-transparent hover:border-[#A6C36F]/30"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-[#E8E3C5]/80 hover:text-[#A6C36F] hover:bg-[#A6C36F]/10 rounded-lg border border-transparent hover:border-[#A6C36F]/30 transition-all"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </button>
                
                <button
                  onClick={() => navigate('/party-amounts')}
                  className="flex items-center px-3 py-2 text-sm font-medium text-[#E8E3C5]/80 hover:text-[#A6C36F] hover:bg-[#A6C36F]/10 rounded-lg border border-transparent hover:border-[#A6C36F]/30 transition-all"
                >
                  <span className="hidden sm:inline">Party Contributions</span>
                </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10">
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
                <PaymentSummaryCard totalPaidAmount={summary.totalPaidAmount} />
                <MemberInfoCard user={user} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-[#A6C36F]/30 hover:border-[#A6C36F]/60 transition-colors group">
                  <p className="text-sm text-[#E8E3C5]/60 font-medium group-hover:text-[#E8E3C5] transition-colors">Paid Payments</p>
                  <p className="text-3xl font-bold text-[#A6C36F] mt-1">
                    {summary.totalPaid}
                  </p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-500/60 transition-colors group">
                  <p className="text-sm text-[#E8E3C5]/60 font-medium group-hover:text-[#E8E3C5] transition-colors">Pending Payments</p>
                  <p className="text-3xl font-bold text-yellow-400 mt-1">{summary.totalPending}</p>
                </div>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-red-500/30 hover:border-red-500/60 transition-colors group">
                  <p className="text-sm text-[#E8E3C5]/60 font-medium group-hover:text-[#E8E3C5] transition-colors">Failed Payments</p>
                  <p className="text-3xl font-bold text-red-500 mt-1">{summary.totalFailed}</p>
                </div>
              </div>

              <FailedPaymentsSection />

              <PaymentHistoryTable
                payments={payments}
                onDownload={handleDownloadProof}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleOpenPay}
                  disabled={openingPayment}
                  className="flex items-center space-x-2 px-8 py-4 text-lg font-bold text-black bg-gradient-to-r from-[#A6C36F] to-[#8FAE5D] hover:shadow-[0_0_25px_rgba(166,195,111,0.4)] rounded-xl transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-6 h-6" />
                  <span>{openingPayment ? 'Preparing...' : 'Pay Group Fund'}</span>
                </button>
              </div>

              <ReimbursementSection userData={user} />
            </div>
          )}
        </main>
      </div>

      <QRPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        paymentMonth={currentRecord ? {
          month: currentRecord.month,
          year: currentRecord.year,
          monthNumber: currentRecord.monthNumber,
          amount: currentRecord.amount,
          treasurerUPI: currentRecord?.treasurerUPI,
        } : null}
        activeRecords={activeRecords}
        onSelectRecord={(record) => setCurrentRecord(record)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default MemberDashboard;