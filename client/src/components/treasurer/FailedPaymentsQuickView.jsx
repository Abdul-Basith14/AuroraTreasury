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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1F221C] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto border border-[#3A3E36] shadow-[0_0_30px_rgba(166,195,111,0.1)]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0B0B09]/95 backdrop-blur-md border-b border-[#3A3E36] p-6 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold flex items-center text-[#F5F3E7]">
                <AlertCircle className="w-8 h-8 mr-3 text-red-500" />
                Failed Payments Summary
              </h2>
              <p className="text-[#E8E3C5]/60 text-sm mt-1 ml-11">Overview of all failed payments by month</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#E8E3C5]/50 hover:text-[#F5F3E7] p-2 rounded-full hover:bg-[#3A3E36] transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A6C36F]"></div>
            </div>
          ) : summary.length === 0 ? (
            <div className="text-center py-12 text-[#E8E3C5]/40">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium text-[#F5F3E7] mb-2">No Failed Payments</h3>
              <p>All members are up to date with their payments!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {summary.map((item, index) => (
                <div 
                  key={index}
                  className="border border-red-900/30 rounded-xl p-4 bg-red-900/5 hover:bg-red-900/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#F5F3E7]">{item.month}</h3>
                      <div className="flex items-center space-x-4 mt-1 text-sm">
                        <span className="flex items-center text-red-400">
                          <Users className="w-4 h-4 mr-1" />
                          {item.count} member{item.count !== 1 ? 's' : ''}
                        </span>
                        <span className="font-bold text-[#F5F3E7]">₹{item.amount}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Members List */}
                  <div className="bg-[#0B0B09] rounded-lg p-3 border border-[#3A3E36]">
                    <p className="text-xs font-semibold text-[#E8E3C5]/60 mb-2 uppercase tracking-wider">Members:</p>
                    <div className="space-y-2">
                      {item.members.map((member, idx) => (
                        <div 
                          key={idx}
                          className="flex justify-between items-center text-sm p-2 hover:bg-[#1F221C] rounded transition-colors"
                        >
                          <span className="text-[#F5F3E7] font-medium">{member.name}</span>
                          <span className="text-[#E8E3C5]/50 text-xs">{member.usn}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FailedPaymentsQuickView;