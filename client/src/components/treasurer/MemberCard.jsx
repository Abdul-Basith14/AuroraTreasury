import React from 'react';
import { 
  User, 
  GraduationCap, 
  CheckCircle,
  AlertCircle,
  Clock,
  RotateCw
} from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_15px_rgba(166,195,111,0.05)]';
// ------------------------------------------------

/**
 * Member Card Component
 * Displays individual member information with payment statistics
 */
const MemberCard = ({ member, onViewDetails }) => {
  /**
   * Get status configuration based on overall status (Dark Theme Adaptation)
   * @param {string} status - Overall status (Good/Pending/Failed)
   * @returns {Object} - Status configuration
   */
  const getStatusConfig = (status) => {
    const configs = {
      'Good': {
        bg: 'bg-green-900/20',
        border: 'border-green-800/50',
        text: 'text-green-400',
        icon: CheckCircle,
        iconColor: 'text-green-400'
      },
      'Pending': {
        bg: 'bg-yellow-900/20',
        border: 'border-yellow-800/50',
        text: 'text-yellow-400',
        icon: Clock,
        iconColor: 'text-yellow-400'
      },
      'Failed': {
        bg: 'bg-red-900/20',
        border: 'border-red-800/50',
        text: 'text-red-400',
        icon: AlertCircle,
        iconColor: 'text-red-400'
      }
    };
    return configs[status] || configs['Pending'];
  };
  
  const statusConfig = getStatusConfig(member.overallStatus);
  const StatusIcon = statusConfig.icon;
  
  return (
    <div 
      className={`border ${statusConfig.border} ${statusConfig.bg} rounded-xl p-5 hover:border-[${ACCENT_OLIVE}] transition-all duration-200 cursor-pointer ${SHADOW_GLOW} bg-[${BACKGROUND_SECONDARY}]`}
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
              className={`w-12 h-12 rounded-full object-cover border-2 border-[${ACCENT_OLIVE}]/50 shadow`}
            />
          ) : (
            <div className={`w-12 h-12 rounded-full bg-[${BORDER_DIVIDER}] flex items-center justify-center border-2 border-[${ACCENT_OLIVE}]/50`}>
              <User className={`w-6 h-6 text-[${TEXT_SECONDARY}]/60`} />
            </div>
          )}
          {/* Resubmission indicator (Olive Dot) */}
          {member.stats.hasResubmissions && (
            <div 
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-[${BACKGROUND_SECONDARY}] flex items-center justify-center`}
              style={{ backgroundColor: ACCENT_OLIVE }}
              title="Has pending resubmissions"
            >
              <RotateCw className="w-2 h-2 text-black" />
              <span className="sr-only">Has resubmissions</span>
            </div>
          )}
        </div>
        
        {/* Name & USN */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-[${TEXT_PRIMARY}] truncate`}>{member.name}</h3>
          <p className={`text-xs text-[${TEXT_SECONDARY}]/70`}>{member.usn}</p>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.border} border`}>
          <StatusIcon className={`w-4 h-4 mr-1 ${statusConfig.iconColor}`} />
          <span className={statusConfig.text}>{member.overallStatus}</span>
        </div>
      </div>
      
      {/* Details - Year & Branch */}
      <div className="space-y-2 mb-4 text-sm">
        <div className={`flex items-center text-[${TEXT_SECONDARY}]/80`}>
          <GraduationCap className={`w-4 h-4 mr-2 text-[${ACCENT_OLIVE}]`} />
          <span>{member.year} • {member.branch}</span>
        </div>
        
        {/* Payment Stats Grid - Darker background for contrast */}
        <div className="grid grid-cols-3 gap-2 mt-3 p-2 bg-[${BACKGROUND_PRIMARY}]/50 rounded-lg border border-[${BORDER_DIVIDER}]">
          <div className="text-center p-1">
            <div className="text-lg font-bold text-green-400">{member.stats.paidCount}</div>
            <div className={`text-xs text-[${TEXT_SECONDARY}]/70`}>Paid</div>
          </div>
          <div className="text-center p-1">
            <div className="text-lg font-bold text-yellow-400">{member.stats.pendingCount}</div>
            <div className={`text-xs text-[${TEXT_SECONDARY}]/70`}>Pending</div>
          </div>
          <div className="text-center p-1">
            <div className="text-lg font-bold text-red-400">{member.stats.failedCount}</div>
            <div className={`text-xs text-[${TEXT_SECONDARY}]/70`}>Failed</div>
          </div>
        </div>
        
        {/* Total Paid - Highlighted */}
        <div className={`flex justify-between items-center mt-3 p-2 bg-[${BACKGROUND_PRIMARY}] rounded-lg border border-[${BORDER_DIVIDER}]`}>
          <span className={`text-xs font-medium text-[${TEXT_SECONDARY}]/70`}>Total Paid:</span>
          <span className={`text-sm font-bold text-[${ACCENT_OLIVE}]`}>₹{member.totalPaid}</span>
        </div>
      </div>
      
      {/* Action Button - Olive Accent */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails(member);
        }}
        className={`w-full py-2 bg-[${ACCENT_OLIVE}] text-black rounded-lg hover:bg-opacity-90 font-bold text-sm transition-colors duration-200`}
      >
        View Details →
      </button>
      
      {/* Failed Payment Alert (Themed) */}
      {member.stats.failedCount > 0 && (
        <div className="mt-3 p-2 bg-red-900/20 border border-red-700/50 rounded flex items-center text-xs text-red-400">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">
            **{member.stats.failedCount}** failed payment{member.stats.failedCount !== 1 ? 's' : ''} require attention.
          </span>
        </div>
      )}
      
      {/* Resubmission Alert (Themed) */}
      {member.stats.hasResubmissions && (
        <div className="mt-2 p-2 bg-orange-900/20 border border-orange-700/50 rounded flex items-center text-xs text-orange-400">
          <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="font-medium">Has **pending resubmissions** for review.</span>
        </div>
      )}
    </div>
  );
};

export default MemberCard;