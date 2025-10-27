import React from 'react';
import { 
  Users, 
  IndianRupee, 
  AlertCircle,
  Clock 
} from 'lucide-react';

/**
 * Dashboard Statistics Cards Component
 * Displays key metrics in card format
 */
const DashboardStats = ({ statistics, loading, onViewFailedPayments }) => {
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
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      title: 'This Month',
      value: `₹${statistics.currentMonth.collected}`,
      subtitle: `${statistics.currentMonth.paid} payments received`,
      icon: IndianRupee,
      color: 'green',
      gradient: 'from-green-500 to-green-600'
    },
    {
      title: 'Failed Payments',
      value: statistics.overall.totalFailedPayments,
      subtitle: 'Need attention',
      icon: AlertCircle,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      clickable: true,
      onClick: onViewFailedPayments
    },
    {
      title: 'Pending Verification',
      value: statistics.overall.pendingResubmissions,
      subtitle: 'Resubmissions to review',
      icon: Clock,
      color: 'yellow',
      gradient: 'from-yellow-500 to-yellow-600'
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            onClick={card.clickable ? card.onClick : undefined}
            className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
              card.clickable ? 'cursor-pointer' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <IconComponent className="w-10 h-10 opacity-80" />
              {card.clickable && (
                <span className="text-xs bg-white bg-opacity-20 px-2 py-1 rounded">
                  Click to view
                </span>
              )}
            </div>
            <div className="text-3xl font-bold mb-1">{card.value}</div>
            <div className="text-sm opacity-90">{card.title}</div>
            <div className="text-xs opacity-75 mt-2">{card.subtitle}</div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Skeleton Card Component for loading state
 */
const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
    <div className="h-10 w-10 bg-gray-200 rounded-full mb-4"></div>
    <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
    <div className="h-3 bg-gray-200 rounded w-full"></div>
  </div>
);

export default DashboardStats;
