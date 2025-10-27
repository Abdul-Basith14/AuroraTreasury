import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getMemberPayments } from '../../utils/treasurerAPI';
import { X, User, IndianRupee, Calendar } from 'lucide-react';

/**
 * Member Details Modal Component
 * Shows detailed payment history for a specific member
 */
const MemberDetailsModal = ({ isOpen, onClose, member }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
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
   * Get status badge classes
   * @param {string} status - Payment status
   * @returns {string} - CSS classes
   */
  const getStatusBadge = (status) => {
    const configs = {
      'Paid': 'bg-green-100 text-green-800 border-green-200',
      'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Failed': 'bg-red-100 text-red-800 border-red-200'
    };
    return configs[status] || configs['Pending'];
  };
  
  // Don't render if modal is not open
  if (!isOpen || !member) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              {member.profilePhoto ? (
                <img
                  src={member.profilePhoto}
                  alt={member.name}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold">{member.name}</h2>
                <p className="text-blue-100">{member.usn}</p>
                <p className="text-sm text-blue-100 mt-1">{member.year} • {member.branch}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-700">{member.stats.paidCount}</div>
              <div className="text-xs text-green-600 font-medium">Paid</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-700">{member.stats.pendingCount}</div>
              <div className="text-xs text-yellow-600 font-medium">Pending</div>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-700">{member.stats.failedCount}</div>
              <div className="text-xs text-red-600 font-medium">Failed</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
              <div className="text-xl font-bold text-blue-700">₹{member.totalPaid}</div>
              <div className="text-xs text-blue-600 font-medium">Total Paid</div>
            </div>
          </div>
          
          {/* Payment History */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment History</h3>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No payment records found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map(payment => (
                  <div 
                    key={payment._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <span className="font-semibold text-gray-900">{payment.month}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <IndianRupee className="w-5 h-5 text-gray-400" />
                          <span className="text-lg font-bold text-gray-900">₹{payment.amount}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadge(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Deadline:</span>
                        <span className="ml-2 text-gray-900 font-medium">
                          {new Date(payment.deadline).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      
                      {payment.paymentDate && (
                        <div>
                          <span className="text-gray-600">Paid On:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                          </span>
                        </div>
                      )}
                      
                      {payment.verifiedBy && (
                        <div>
                          <span className="text-gray-600">Verified By:</span>
                          <span className="ml-2 text-gray-900 font-medium">
                            {payment.verifiedBy.name}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Proof */}
                    {payment.paymentProof && (
                      <div className="mt-3">
                        <button
                          onClick={() => window.open(payment.paymentProof, '_blank')}
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                        >
                          View Payment Proof →
                        </button>
                      </div>
                    )}
                    
                    {/* Resubmission Info */}
                    {payment.failedPaymentSubmission?.resubmittedPhoto && (
                      <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-orange-800">Payment Resubmitted</p>
                            <p className="text-xs text-orange-700">
                              {new Date(payment.failedPaymentSubmission.resubmittedDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                          <button
                            onClick={() => window.open(payment.failedPaymentSubmission.resubmittedPhoto, '_blank')}
                            className="text-xs text-orange-700 hover:text-orange-900 font-medium px-3 py-1 bg-white rounded border border-orange-300 transition-colors duration-200"
                          >
                            View Proof
                          </button>
                        </div>
                        {payment.failedPaymentSubmission.resubmissionNote && (
                          <p className="text-xs text-orange-700 mt-2">
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
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center rounded-b-2xl">
          <div className="text-sm text-gray-600">
            Joined: {new Date(member.joinedDate).toLocaleDateString('en-IN')}
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDetailsModal;
