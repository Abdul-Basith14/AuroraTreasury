import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMemberPayments } from '../../utils/treasurerAPI';
import { X, User, IndianRupee, Calendar, CheckCircle } from 'lucide-react';
import ManualPaymentUpdateModal from './ManualPaymentUpdateModal';

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
 * Member Details Modal Component
 * Shows detailed payment history for a specific member
 */
const MemberDetailsModal = ({ isOpen, onClose, member, refreshMembers }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showManualUpdateModal, setShowManualUpdateModal] = useState(false);
  const [selectedPaymentForUpdate, setSelectedPaymentForUpdate] = useState(null);
  
  // Fetch member payments when modal opens
  useEffect(() => {
    if (isOpen && member) {
      fetchMemberPayments();
    }
  }, [isOpen, member]);
  
  /**
   * Fetch all payments for the selected member
   */
  const fetchMemberPayments = async () => {
    setLoading(true);
    try {
      const data = await getMemberPayments(member._id);
      setPayments(data.payments || []);
    } catch (error) {
      toast.error('Failed to load member payments');
      console.error('Error fetching member payments:', error);
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle manual payment update
   */
  const handleManualUpdate = (payment) => {
    setSelectedPaymentForUpdate(payment);
    setShowManualUpdateModal(true);
  };

  /**
   * Handle manual update success
   */
  const handleManualUpdateSuccess = () => {
    setShowManualUpdateModal(false);
    setSelectedPaymentForUpdate(null);
    fetchMemberPayments(); // Refresh payments in modal
    
    // Also refresh the main member list
    if (refreshMembers) {
      refreshMembers();
    }
  };
  
  /**
   * Get status badge classes for dark theme
   * @param {string} status - Payment status
   * @returns {string} - CSS classes
   */
  const getStatusBadge = (status) => {
    const configs = {
      'Paid': 'bg-green-900/40 text-green-400 border-green-700/50',
      'Pending': 'bg-yellow-900/40 text-yellow-400 border-yellow-700/50',
      'Failed': 'bg-red-900/40 text-red-400 border-red-700/50'
    };
    return configs[status] || configs['Pending'];
  };
  
  // Don't render if modal is not open
  if (!isOpen || !member) return null;
  
  return (
    // Backdrop - Darkened
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Modal Container - Themed Panel */}
      <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
        
        {/* Header - Olive Accent Gradient */}
        <div className={`sticky top-0 bg-[${BACKGROUND_SECONDARY}] border-b border-[${BORDER_DIVIDER}] text-[${TEXT_PRIMARY}] p-6 rounded-t-2xl z-10 
          shadow-[0_4px_10px_rgba(0,0,0,0.4)]`}>
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {/* Profile Photo/Placeholder */}
              {member.profilePhoto ? (
                <img
                  src={member.profilePhoto}
                  alt={member.name}
                  className={`w-16 h-16 rounded-full border-4 border-[${ACCENT_OLIVE}] shadow-lg object-cover`}
                />
              ) : (
                <div className={`w-16 h-16 rounded-full bg-[${BORDER_DIVIDER}] flex items-center justify-center border-2 border-[${ACCENT_OLIVE}]`}>
                  <User className={`w-8 h-8 text-[${ACCENT_OLIVE}]`} />
                </div>
              )}
              {/* Member Info */}
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className={`text-[${TEXT_SECONDARY}]/80`}>{member.usn}</p>
                <p className={`text-sm text-[${TEXT_SECONDARY}]/60 mt-1`}>{member.year} • {member.branch}</p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className={`text-[${TEXT_SECONDARY}]/70 hover:bg-[${BORDER_DIVIDER}] hover:text-[${TEXT_PRIMARY}] p-2 rounded-full transition-colors duration-200`}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Summary Stats - Themed Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-green-900/20 border border-green-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{member.stats?.paidCount ?? 0}</div>
              <div className="text-xs text-green-500 font-medium">Paid</div>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">{member.stats?.pendingCount ?? 0}</div>
              <div className="text-xs text-yellow-500 font-medium">Pending</div>
            </div>
            <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">{member.stats?.failedCount ?? 0}</div>
              <div className="text-xs text-red-500 font-medium">Failed</div>
            </div>
            <div className={`bg-[${ACCENT_OLIVE}]/20 border border-[${ACCENT_OLIVE}]/50 rounded-lg p-4 text-center`}>
              <div className={`text-xl font-bold text-[${ACCENT_OLIVE}]`}>₹{member.totalPaid ?? 0}</div>
              <div className={`text-xs text-[${ACCENT_OLIVE}] font-medium`}>Total Paid</div>
            </div>
          </div>
          
          {/* Payment History */}
          <div>
            <h3 className={`text-lg font-bold text-[${TEXT_PRIMARY}] mb-4`}>Payment History</h3>
            
            {loading ? (
              // Themed Loading Spinner
              <div className="flex justify-center py-12">
                <div 
                  className="animate-spin rounded-full h-12 w-12 border-b-2" 
                  style={{ borderColor: ACCENT_OLIVE }}
                ></div>
              </div>
            ) : payments.length === 0 ? (
              // Themed Empty State
              <div className="text-center py-12 text-[${TEXT_SECONDARY}]/50 bg-[${BACKGROUND_PRIMARY}] rounded-lg border border-[${BORDER_DIVIDER}]">
                <Calendar className={`w-12 h-12 mx-auto mb-2 text-[${BORDER_DIVIDER}]`} />
                <p>No payment records found for this member.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div 
                    key={payment._id}
                    className={`border border-[${BORDER_DIVIDER}] rounded-lg p-4 hover:shadow-xl transition-shadow duration-200 bg-[${BACKGROUND_PRIMARY}]`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className={`w-5 h-5 text-[${TEXT_SECONDARY}]/60`} />
                          <span className={`font-semibold text-[${TEXT_PRIMARY}]`}>{payment.month}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <IndianRupee className={`w-5 h-5 text-[${TEXT_SECONDARY}]/60`} />
                          <span className={`text-lg font-bold text-[${TEXT_PRIMARY}]`}>₹{payment.amount}</span>
                        </div>
                      </div>
                      {/* Status Badge */}
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-[${TEXT_SECONDARY}]">
                      <div>
                        <span className="text-[${TEXT_SECONDARY}]/60">Deadline:</span>
                        <span className={`ml-2 text-[${TEXT_PRIMARY}] font-medium`}>
                          {new Date(payment.deadline).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      
                      {payment.paymentDate && (
                        <div>
                          <span className="text-[${TEXT_SECONDARY}]/60">Paid On:</span>
                          <span className={`ml-2 text-[${TEXT_PRIMARY}] font-medium`}>
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      
                      {payment.paymentMethod && (
                        <div>
                          <span className="text-[${TEXT_SECONDARY}]/60">Method:</span>
                          <span className={`ml-2 font-medium ${
                            payment.paymentMethod === 'Cash' ? 'text-green-500' : 
                            payment.paymentMethod === 'Bank Transfer' ? 'text-blue-500' :
                            payment.paymentMethod === 'Online' ? 'text-purple-500' : 'text-[${TEXT_PRIMARY}]'
                          }`}>
                            {payment.paymentMethod}
                          </span>
                        </div>
                      )}
                      
                      {payment.verifiedBy && (
                        <div>
                          <span className="text-[${TEXT_SECONDARY}]/60">Verified By:</span>
                          <span className={`ml-2 text-[${TEXT_PRIMARY}] font-medium`}>
                            {payment.verifiedBy.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex space-x-2 mt-4 border-t border-[${BORDER_DIVIDER}]/70 pt-3">
                      {/* Payment Proof Button (Themed) */}
                      {payment.paymentProof && (
                        <button
                          onClick={() => window.open(payment.paymentProof, '_blank')}
                          className={`flex-1 text-sm text-[${ACCENT_OLIVE}] hover:text-white font-medium py-2 px-3 border border-[${ACCENT_OLIVE}]/50 rounded hover:bg-[${ACCENT_OLIVE}]/20 transition-colors duration-200`}
                        >
                          View Proof
                        </button>
                      )}
                      
                      {/* Manual Update Button (Themed) - Only for Pending status and when there's no payment proof */}
                      {payment.status === 'Pending' && !payment.paymentProof && (
                        <button
                          onClick={() => handleManualUpdate(payment)}
                          className="flex-1 text-sm text-green-400 hover:text-white font-medium py-2 px-3 border border-green-600/50 rounded hover:bg-green-700/50 flex items-center justify-center transition-colors duration-200"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark as Paid
                        </button>
                      )}
                      {payment.status === 'Pending' && payment.paymentProof && (
                        <span className="flex-1 text-sm text-yellow-500 font-medium py-2 px-3 text-center border border-yellow-800/50 rounded bg-yellow-900/20">Awaiting Verification</span>
                      )}
                    </div>
                    
                    {/* Resubmission Info (Themed) */}
                    {payment.failedPaymentSubmission?.resubmittedPhoto && (
                      <div className="mt-3 p-3 bg-orange-900/20 border border-orange-700/50 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-orange-400">Payment Resubmitted</p>
                            <p className="text-xs text-orange-500">
                              {new Date(payment.failedPaymentSubmission.resubmittedDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(payment.failedPaymentSubmission.resubmittedPhoto, '_blank')}
                            className="text-xs text-orange-500 hover:text-white font-medium px-3 py-1 bg-transparent rounded border border-orange-700/50 hover:bg-orange-700/50 transition-colors duration-200"
                          >
                            View New Proof
                          </button>
                        </div>
                        {payment.failedPaymentSubmission.resubmissionNote && (
                          <p className="text-xs text-orange-500 mt-2">
                            <span className="font-medium">Note:</span> {payment.failedPaymentSubmission.resubmissionNote}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Footer - Themed */}
        <div className={`sticky bottom-0 bg-[${BACKGROUND_PRIMARY}] px-6 py-4 border-t border-[${BORDER_DIVIDER}] flex justify-between items-center rounded-b-2xl`}>
          <div className={`text-sm text-[${TEXT_SECONDARY}]/70`}>
            Joined: {new Date(member.joinedDate).toLocaleDateString('en-IN')}
          </div>
          {/* Close Button - Themed */}
          <button
            onClick={onClose}
            className={`px-6 py-2 bg-[${ACCENT_OLIVE}] text-black rounded-lg hover:bg-opacity-80 font-bold transition-colors duration-200`}
          >
            Close
          </button>
        </div>
      </div>
      
      {/* Manual Payment Update Modal (Assuming it is themed separately) */}
      <ManualPaymentUpdateModal
        isOpen={showManualUpdateModal}
        onClose={() => setShowManualUpdateModal(false)}
        payment={selectedPaymentForUpdate}
        member={member}
        onSuccess={handleManualUpdateSuccess}
      />
    </div>
  );
};

export default MemberDetailsModal;