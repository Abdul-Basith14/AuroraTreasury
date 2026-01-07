import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getPaymentRequests } from '../../utils/treasurerAPI';
import PaymentRequestCard from './PaymentRequestCard';
import RequestFilters from './RequestFilters';
import { Clock } from 'lucide-react';

/**
 * Pending Requests Tab - Displays and manages pending payment requests
 */
const PendingRequestsTab = ({ refreshTrigger, onActionComplete }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'Pending',
    month: '',
    year: 'all'
  });

  // Fetch payment requests
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await getPaymentRequests(filters);
      
      if (data.success) {
        // Ensure that even if the API returns more statuses, only 'Pending' ones are shown here
        // (assuming getPaymentRequests respects the filters, but double-check for safety)
        const pendingRequests = (data.requests || []).filter(r => r.status === 'Pending' || r.status === 'Submitted');
        setRequests(pendingRequests);
      } else {
        toast.error(data.message || 'Failed to fetch payment requests');
      }
    } catch (error) {
      console.error('Error fetching payment requests:', error);
      toast.error(error.message || 'Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [filters, refreshTrigger]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // Merge existing status filter to ensure it remains 'Pending'
    setFilters({ ...newFilters, status: 'Pending' });
  };

  // Handle action complete (verify/reject)
  const handleActionComplete = () => {
    // Re-fetch to update the list after an action
    fetchRequests();
    if (onActionComplete) {
      onActionComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6C36F]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <RequestFilters 
        filters={filters} 
        onFilterChange={handleFilterChange}
        showStatusFilter={false}
      />

      {/* Results Summary */}
      <div className="bg-black/40 rounded-xl p-4 shadow-sm border border-[#A6C36F]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-[#A6C36F]" />
            <span className="font-semibold text-[#F5F3E7]">
              {requests.length} Pending {requests.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Requests List */}
      {requests.length === 0 ? (
        <div className="bg-black/40 rounded-2xl p-12 text-center border border-[#A6C36F]/20 shadow-[0_0_25px_rgba(166,195,111,0.08)]">
          <Clock className="w-16 h-16 text-[#A6C36F]/20 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-[#F5F3E7] mb-2">
            No Pending Requests
          </h3>
          <p className="text-[#E8E3C5]/80">
            All payment requests have been processed for the current filters.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <PaymentRequestCard
              key={request._id}
              request={request}
              onActionComplete={handleActionComplete}
              isResubmission={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingRequestsTab;