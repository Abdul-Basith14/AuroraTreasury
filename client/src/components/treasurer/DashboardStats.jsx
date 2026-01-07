import React from 'react';
import { 
  Users, 
  IndianRupee, 
  AlertCircle,
  Clock 
} from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const TEXT_PRIMARY = '#F5F3E7';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

/**
 * Dashboard Statistics Cards Component
 * Displays key metrics in card format
 */
const DashboardStats = ({ statistics, loading, onViewFailedPayments }) => {
  
  // Custom theme function to generate card styles
  const getCardTheme = (color) => {
    switch (color) {
      case 'blue':
        // Total Members (Primary Metric) - Use Olive Accent
        return { 
          iconColor: `text-[${ACCENT_OLIVE}]`, 
          bgColor: `bg-[${BACKGROUND_PRIMARY}]`,
          borderColor: `border-[${ACCENT_OLIVE}]/50`,
          hoverStyle: `hover:border-[${ACCENT_OLIVE}] hover:bg-[${BACKGROUND_PRIMARY}]/80`
        };
      case 'green':
        // Collected This Month (Success)
        return { 
          iconColor: 'text-green-400', 
          bgColor: `bg-[${BACKGROUND_PRIMARY}]`,
          borderColor: 'border-green-600/50',
          hoverStyle: 'hover:border-green-400 hover:bg-[${BACKGROUND_PRIMARY}]/80'
        };
      case 'red':
        // Failed Payments (Alert)
        return { 
          iconColor: 'text-red-400', 
          bgColor: `bg-[${BACKGROUND_PRIMARY}]`,
          borderColor: 'border-red-600/50',
          hoverStyle: 'hover:border-red-400 hover:bg-[${BACKGROUND_PRIMARY}]/80'
        };
      case 'yellow':
        // Pending Verification (Warning)
        return { 
          iconColor: 'text-yellow-400', 
          bgColor: `bg-[${BACKGROUND_PRIMARY}]`,
          borderColor: 'border-yellow-600/50',
          hoverStyle: 'hover:border-yellow-400 hover:bg-[${BACKGROUND_PRIMARY}]/80'
        };
      default:
        return {};
    }
  };

  // Show skeleton loaders while loading
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
      </div>
    );
  }
  
  // Return null if no statistics available
  if (!statistics) return null;
  
  // Define statistics cards configuration
  const cards = [
    {
      title: 'Total Members',
      value: statistics.totalMembers,
      subtitle: 'Registered members',
      icon: Users,
      color: 'blue', // Mapped to Olive Accent
      valueColor: `text-[${ACCENT_OLIVE}]`
    },
    {
      title: 'This Month Collected',
      value: `₹${statistics.currentMonth.collected}`,
      subtitle: `${statistics.currentMonth.paid} payments received`,
      icon: IndianRupee,
      color: 'green',
      valueColor: 'text-green-400'
    },
    {
      title: 'Failed Payments',
      value: statistics.overall.totalFailedPayments,
      subtitle: 'Need attention',
      icon: AlertCircle,
      color: 'red',
      valueColor: 'text-red-400',
      clickable: true,
      onClick: onViewFailedPayments
    },
    {
      title: 'Pending Verification',
      value: statistics.overall.pendingResubmissions,
      subtitle: 'Resubmissions to review',
      icon: Clock,
      color: 'yellow',
      valueColor: 'text-yellow-400'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const theme = getCardTheme(card.color);
        
        return (
          <div
            key={index}
            onClick={card.clickable ? card.onClick : undefined}
            // Themed Card Styles
            className={`${theme.bgColor} rounded-2xl p-6 text-[${TEXT_PRIMARY}] border ${theme.borderColor} ${SHADOW_GLOW} transition-all duration-300 transform ${theme.hoverStyle} ${
              card.clickable ? 'cursor-pointer hover:shadow-lg' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <IconComponent className={`w-10 h-10 opacity-90 ${theme.iconColor}`} />
              {card.clickable && (
                <span className={`text-xs bg-[${ACCENT_OLIVE}]/20 text-[${ACCENT_OLIVE}] px-2 py-1 rounded-full border border-[${ACCENT_OLIVE}]/50 font-medium`}>
                  View
                </span>
              )}
            </div>
            {/* Themed Value */}
            <div className={`text-3xl font-bold mb-1 ${card.valueColor}`}>{card.value}</div>
            <div className={`text-sm text-[${TEXT_PRIMARY}] opacity-90`}>{card.title}</div>
            <div className={`text-xs text-[${TEXT_SECONDARY}] opacity-75 mt-2`}>{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Skeleton Card Component for loading state (Themed)
 */
const SkeletonCard = () => (
  // Themed Skeleton
  <div className={`bg-[${BACKGROUND_PRIMARY}] rounded-2xl p-6 border border-[${BORDER_DIVIDER}] shadow-inner animate-pulse`}>
    <div className="h-10 w-10 bg-[${BORDER_DIVIDER}] rounded-full mb-4"></div>
    <div className="h-8 bg-[${BORDER_DIVIDER}]/50 rounded w-24 mb-2"></div>
    <div className="h-4 bg-[${BORDER_DIVIDER}]/50 rounded w-32 mb-2"></div>
    <div className="h-3 bg-[${BORDER_DIVIDER}]/50 rounded w-full"></div>
  </div>
);

export default DashboardStats;