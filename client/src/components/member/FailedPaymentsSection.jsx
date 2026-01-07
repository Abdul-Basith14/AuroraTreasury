import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';
import FailedPaymentCard from './FailedPaymentCard';
import PayFailedPaymentModal from './PayFailedPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';

/**
 * FailedPaymentsSection Component (Bright Olive Elegance Themed)
 * Displays all failed payments with option to resubmit payment proof
 */
const FailedPaymentsSection = () => {
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  useEffect(() => {
    fetchFailedPayments();
  }, []);

  const fetchFailedPayments = async () => {
    setLoading(true);
    try {
      const response = await groupFundAPI.getFailedPayments();
      if (response.success) {
        setFailedPayments(response.payments || []);
      }
    } catch (error) {
      console.error('Error fetching failed payments:', error);
      toast.error('Failed to load failed payments');
    } finally {
      setLoading(false);
    }
  };

  const handlePayClick = (payment) => {
    setSelectedPayment(payment);
    setShowPayModal(true);
  };

  const handleViewHistory = (payment) => {
    setSelectedPayment(payment);
    setShowHistoryModal(true);
  };

  if (!loading && failedPayments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-10 mb-10">
        {/* Header */}
        <div className="bg-[#1F221C] border border-[#3A3E36] rounded-t-2xl p-6 text-[#F5F3E7] shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-1 flex items-center">
                <AlertTriangle className="w-7 h-7 mr-2 text-[#A6C36F]" />
                Failed Payments
              </h2>
              <p className="text-sm text-[#E8E3C5] opacity-80">
                Pay your missed monthly contributions
              </p>
            </div>
            {failedPayments.length > 0 && (
              <div className="bg-[#2A2D25] border border-[#3A3E36] px-4 py-2 rounded-xl">
                <p className="text-sm font-semibold text-[#A6C36F]">
                  {failedPayments.length} Failed Payment
                  {failedPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Failed Payments Grid */}
        <div className="bg-[#0B0B09] border border-t-0 border-[#3A3E36] rounded-b-2xl p-6 shadow-lg">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Alert Banner */}
              <div className="mb-6 p-4 bg-[#2B2F26] border-l-4 border-[#A6C36F] rounded-lg shadow-sm">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-[#A6C36F] mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-[#E8E3C5]">
                      You have {failedPayments.length} failed payment
                      {failedPayments.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-[#C9C6A8] mt-1">
                      Please pay these amounts as soon as possible to avoid any issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {failedPayments.map((payment) => (
                  <FailedPaymentCard
                    key={payment._id}
                    payment={payment}
                    onPayClick={handlePayClick}
                    onViewHistory={handleViewHistory}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <PayFailedPaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        payment={selectedPayment}
        refreshPayments={fetchFailedPayments}
      />

      <PaymentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        payment={selectedPayment}
      />
    </>
  );
};

/**
 * Skeleton Card for loading
 */
const SkeletonCard = () => (
  <div className="border border-[#3A3E36] rounded-2xl p-4 animate-pulse bg-[#1F221C]">
    <div className="h-6 bg-[#3A3E36] rounded w-32 mb-3"></div>
    <div className="h-8 bg-[#3A3E36] rounded w-20 mb-3"></div>
    <div className="h-4 bg-[#3A3E36] rounded w-full mb-2"></div>
    <div className="h-10 bg-[#3A3E36] rounded w-full mt-4"></div>
  </div>
);

export default FailedPaymentsSection;
