import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getResubmissionRequests } from '../../utils/treasurerAPI';
import PaymentRequestCard from './PaymentRequestCard';
import { RotateCw } from 'lucide-react';

/**
 * Resubmissions Tab - Displays and manages resubmitted payment requests
 */
const ResubmissionsTab = ({ refreshTrigger, onActionComplete }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch resubmission requests
  const fetchResubmissions = async () => {
    try {
      setLoading(true);
      const data = await getResubmissionRequests();
      
      if (data.success) {
        setRequests(data.requests || []);
      } else {
        toast.error(data.message || 'Failed to fetch resubmission requests');
      }
    } catch (error) {
      console.error('Error fetching resubmission requests:', error);
      toast.error(error.message || 'Failed to fetch resubmission requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResubmissions();
  }, [refreshTrigger]);

  // Handle action complete (verify/reject)
  const handleActionComplete = () => {
    fetchResubmissions();
    if (onActionComplete) {
      onActionComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCw className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-gray-900">
              {requests.length} {requests.length === 1 ? 'Resubmission' : 'Resubmissions'}
            </span>
          </div>
        </div>
      </div>

      {/* Resubmission Requests List */}
      {requests.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm">
          <RotateCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Resubmissions
          </h3>
          <p className="text-gray-600">
            There are no resubmitted payment proofs to review.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <PaymentRequestCard
              key={request._id}
              request={request}
              onActionComplete={handleActionComplete}
              isResubmission={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResubmissionsTab;
