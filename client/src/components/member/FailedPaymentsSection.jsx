import { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupFundAPI } from '../../utils/api';
import FailedPaymentCard from './FailedPaymentCard';
import PayFailedPaymentModal from './PayFailedPaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';

/**
 * FailedPaymentsSection Component
 * Displays all failed payments with option to resubmit payment proof
 * Only shows if user has failed payments
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

  /**
   * Fetch all failed payments from API
   */
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

  /**
   * Handle pay button click
   */
  const handlePayClick = (payment) => {
    setSelectedPayment(payment);
    setShowPayModal(true);
  };

  /**
   * Handle view history button click
   */
  const handleViewHistory = (payment) => {
    setSelectedPayment(payment);
    setShowHistoryModal(true);
  };

  // Don't show section if no failed payments
  if (!loading && failedPayments.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-8 mb-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-t-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2 flex items-center">
                <AlertTriangle className="w-8 h-8 mr-2" />
                Failed Payments
              </h2>
              <p className="text-white text-opacity-90">
                Pay your missed monthly contributions
              </p>
            </div>
            {failedPayments.length > 0 && (
              <div className="bg-white bg-opacity-20 px-4 py-2 rounded-lg">
                <p className="text-sm font-semibold">
                  {failedPayments.length} Failed Payment
                  {failedPayments.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Failed Payments Grid */}
        <div className="bg-white rounded-b-2xl shadow-lg p-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Alert Banner */}
              <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      You have {failedPayments.length} failed payment
                      {failedPayments.length !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Please pay these amounts as soon as possible to avoid any issues.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

      {/* Pay Failed Payment Modal */}
      <PayFailedPaymentModal
        isOpen={showPayModal}
        onClose={() => setShowPayModal(false)}
        payment={selectedPayment}
        refreshPayments={fetchFailedPayments}
      />

      {/* Payment History Modal */}
      <PaymentHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        payment={selectedPayment}
      />
    </>
  );
};

/**
 * Skeleton Card Component for loading state
 */
const SkeletonCard = () => (
  <div className="border-2 border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="h-6 bg-gray-200 rounded w-32 mb-3"></div>
    <div className="h-8 bg-gray-200 rounded w-20 mb-3"></div>
    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
  </div>
);

export default FailedPaymentsSection;
