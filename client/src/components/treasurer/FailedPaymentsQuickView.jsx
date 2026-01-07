import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getFailedPaymentsSummary } from '../../utils/treasurerAPI';
import { X, AlertCircle, Users } from 'lucide-react';

/**
 * Failed Payments Quick View Component
 * Shows summary of all failed payments grouped by month
 */
const FailedPaymentsQuickView = ({ isOpen, onClose }) => {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Fetch failed payments summary when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);
  
  /**
   * Fetch failed payments summary from API
   */
  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await getFailedPaymentsSummary();
      setSummary(data.summary || []);
    } catch (error) {
      toast.error('Failed to load failed payments summary');
      console.error('Error fetching failed payments summary:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Don't render if modal is not open
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-red-500 to-orange-500 text-white p-6 rounded-t-2xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center">
                <AlertCircle className="w-8 h-8 mr-2" />
                Failed Payments Summary
              </h2>
              <p className="text-red-100 text-sm mt-1">Overview of all failed payments by month</p>
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
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Payments</h3>
              <p>All members are up to date with their payments!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.map((item, index) => (
                <div 
                  key={index}
                  className="border-2 border-red-200 rounded-lg p-4 bg-red-50"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{item.month}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="flex items-center text-red-700">
                          <Users className="w-4 h-4 mr-1" />
                          {item.count} member{item.count !== 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-red-900">₹{item.amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Members List */}
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Members:</p>
                    <div className="space-y-2">
                      {item.members.map((member, idx) => (
                        <div 
                          key={idx}
                          className="flex justify-between items-center text-sm py-2 border-b border-gray-100 last:border-0"
                        >
                          <div>
                            <span className="font-medium text-gray-900">{member.name}</span>
                            <span className="text-gray-600 ml-2">({member.usn})</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-gray-900">₹{member.amount}</div>
                            <div className="text-xs text-gray-600">{member.year} • {member.branch}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailedPaymentsQuickView;
