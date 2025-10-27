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
        setRequests(data.requests || []);
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
    setFilters(newFilters);
  };

  // Handle action complete (verify/reject)
  const handleActionComplete = () => {
    fetchRequests();
    if (onActionComplete) {
      onActionComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-900">
              {requests.length} Pending {requests.length === 1 ? 'Request' : 'Requests'}
            </span>
          </div>
        </div>
      </div>

      {/* Payment Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Pending Requests
          </h3>
          <p className="text-gray-600">
            All payment requests have been processed.
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
