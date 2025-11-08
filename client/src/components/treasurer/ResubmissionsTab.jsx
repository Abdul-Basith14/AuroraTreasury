import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getResubmissionRequests } from '../../utils/treasurerAPI';
import PaymentRequestCard from './PaymentRequestCard';
import { RotateCw } from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

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
        {/* Themed Spinner */}
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-4" 
          style={{ borderColor: ACCENT_OLIVE }}
        ></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Results Summary - Themed Panel */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl p-4 border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <RotateCw className={`w-5 h-5 text-[${ACCENT_OLIVE}]`} />
            <span className={`font-semibold text-[${TEXT_PRIMARY}]`}>
              {requests.length} {requests.length === 1 ? 'Resubmission' : 'Resubmissions'} to Review
            </span>
          </div>
          {requests.length > 0 && (
            <span className={`text-sm font-medium text-yellow-500`}>
                ⚠️ Awaiting Re-verification
            </span>
          )}
        </div>
      </div>

      {/* Resubmission Requests List */}
      {requests.length === 0 ? (
        // Empty State - Themed Panel
        <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl p-12 text-center border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
          <RotateCw className={`w-16 h-16 text-[${BORDER_DIVIDER}] mx-auto mb-4`} />
          <h3 className={`text-xl font-semibold text-[${TEXT_PRIMARY}] mb-2`}>
            No Resubmissions
          </h3>
          <p className={`text-[${TEXT_SECONDARY}]/70`}>
            There are no payment proofs currently awaiting a re-review.
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
              // PaymentRequestCard (from previous step) should be themed to match the environment
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ResubmissionsTab;