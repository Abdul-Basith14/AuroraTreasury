import React from 'react';
import { 
  User, 
  GraduationCap, 
  CheckCircle,
  AlertCircle,
  Clock 
} from 'lucide-react';

/**
 * Member Card Component
 * Displays individual member information with payment statistics
 */
const MemberCard = ({ member, onViewDetails }) => {
  /**
   * Get status configuration based on overall status
   * @param {string} status - Overall status (Good/Pending/Failed)
   * @returns {Object} - Status configuration
   */
  const getStatusConfig = (status) => {
    const configs = {
      'Good': {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-600'
      },
      'Pending': {
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        icon: Clock,
        iconColor: 'text-yellow-600'
      },
      'Failed': {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        icon: AlertCircle,
        iconColor: 'text-red-600'
      }
    };
    return configs[status] || configs['Pending'];
  };
  
  const statusConfig = getStatusConfig(member.overallStatus);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div 
      className={`border-2 ${statusConfig.border} ${statusConfig.bg} rounded-lg p-4 hover:shadow-md transition-all duration-200 cursor-pointer`}
      onClick={() => onViewDetails(member)}
    >
      {/* Header - Profile, Name, Status */}
      <div className="flex items-start space-x-3 mb-4">
        {/* Profile Photo */}
        <div className="relative flex-shrink-0">
          {member.profilePhoto ? (
            <img
              src={member.profilePhoto}
              alt={member.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
          )}
          {/* Resubmission indicator */}
          {member.stats.hasResubmissions && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full border-2 border-white" title="Has resubmissions">
              <span className="sr-only">Has resubmissions</span>
            </div>
          )}
        </div>
        
        {/* Name & USN */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{member.name}</h3>
          <p className="text-xs text-gray-600">{member.usn}</p>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.border} border`}>
          <StatusIcon className={`w-4 h-4 ${statusConfig.iconColor}`} />
        </div>
      </div>
      
      {/* Details - Year & Branch */}
      <div className="space-y-2 mb-4 text-sm">
        <div className="flex items-center text-gray-600">
          <GraduationCap className="w-4 h-4 mr-2" />
          <span>{member.year} • {member.branch}</span>
        </div>
        
        {/* Payment Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-white rounded">
            <div className="text-lg font-bold text-green-600">{member.stats.paidCount}</div>
            <div className="text-xs text-gray-600">Paid</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="text-lg font-bold text-yellow-600">{member.stats.pendingCount}</div>
            <div className="text-xs text-gray-600">Pending</div>
          </div>
          <div className="text-center p-2 bg-white rounded">
            <div className="text-lg font-bold text-red-600">{member.stats.failedCount}</div>
            <div className="text-xs text-gray-600">Failed</div>
          </div>
        </div>
        
        {/* Total Paid */}
        <div className="flex justify-between items-center mt-3 p-2 bg-white rounded">
          <span className="text-xs font-medium text-gray-600">Total Paid:</span>
          <span className="text-sm font-bold text-gray-900">₹{member.totalPaid}</span>
        </div>
      </div>
      
      {/* Action Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(member);
        }}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm transition-colors duration-200"
      >
        View Details →
      </button>
      
      {/* Failed Payment Alert */}
      {member.stats.failedCount > 0 && (
        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded flex items-center text-xs text-red-800">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">
            {member.stats.failedCount} failed payment{member.stats.failedCount !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      
      {/* Resubmission Alert */}
      {member.stats.hasResubmissions && (
        <div className="mt-2 p-2 bg-orange-100 border border-orange-200 rounded flex items-center text-xs text-orange-800">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">Has pending resubmissions</span>
        </div>
      )}
    </div>
  );
};

export default MemberCard;
