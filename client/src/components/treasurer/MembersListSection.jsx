import React, { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import MemberCard from './MemberCard';
import MemberDetailsModal from './MemberDetailsModal';

/**
 * Members List Section Component
 * Displays grid of member cards with loading and empty states
 */
const MembersListSection = ({ members, loading, selectedYear, selectedStatus, refreshMembers }) => {
  const [selectedMember, setSelectedMember] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Listen for payment verification events
  useEffect(() => {
    const handlePaymentVerified = (event) => {
      console.log('Payment verified, refreshing member list...', event.detail);
      // Refresh the member list
      if (refreshMembers) {
        refreshMembers();
      }
    };
    
    window.addEventListener('paymentVerified', handlePaymentVerified);
    
    return () => {
      window.removeEventListener('paymentVerified', handlePaymentVerified);
    };
  }, [refreshMembers]);
  
  /**
   * Handle viewing member details
   * @param {Object} member - Member object
   */
  const handleViewMember = (member) => {
    setSelectedMember(member);
    setShowDetailsModal(true);
  };
  
  /**
   * Handle closing member details modal
   */
  const handleCloseModal = () => {
    setShowDetailsModal(false);
    setSelectedMember(null);
  };
  
  // Loading State
  if (loading) {
    return (
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonMemberCard key={i} />)}
        </div>
      </div>
    );
  }
  
  // Empty State
  if (members.length === 0) {
    return (
      <div className="p-12 text-center">
        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Members Found</h3>
        <p className="text-gray-500">
          {selectedStatus !== 'all' || selectedYear !== 'all'
            ? 'Try adjusting your filters'
            : 'No members registered yet'}
        </p>
      </div>
    );
  }
  
  // Group members by year
  const groupedMembers = members.reduce((groups, member) => {
    const year = member.year || 'Unknown';
    if (!groups[year]) {
      groups[year] = [];
    }
    groups[year].push(member);
    return groups;
  }, {});
  
  // Sort years in order
  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sortedYears = years.filter(year => groupedMembers[year] && groupedMembers[year].length > 0);
  
  // Add Unknown year if exists
  if (groupedMembers['Unknown'] && groupedMembers['Unknown'].length > 0) {
    sortedYears.push('Unknown');
  }
  
  // Members Grid
  return (
    <>
      <div className="p-6">
        <div className="mb-4 text-sm text-gray-600">
          Showing {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
        
        {/* Display grouped by year when "All Years" is selected */}
        {selectedYear === 'all' && sortedYears.length > 0 ? (
          <div className="space-y-8">
            {sortedYears.map(year => (
              <div key={year}>
                {/* Year Header */}
                <div className="flex items-center mb-4">
                  <div className="flex-1 border-t-2 border-gray-200"></div>
                  <h3 className="px-4 text-lg font-bold text-gray-900 bg-blue-50 py-2 rounded-full">
                    {year}
                    <span className="ml-2 text-sm font-normal text-gray-600">
                      ({groupedMembers[year].length} member{groupedMembers[year].length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className="flex-1 border-t-2 border-gray-200"></div>
                </div>
                
                {/* Members Grid for this year */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMembers[year].map(member => (
                    <MemberCard
                      key={member._id}
                      member={member}
                      onViewDetails={handleViewMember}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Show single year (when filtered by specific year)
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map(member => (
              <MemberCard
                key={member._id}
                member={member}
                onViewDetails={handleViewMember}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Member Details Modal */}
      <MemberDetailsModal
        isOpen={showDetailsModal}
        onClose={handleCloseModal}
        member={selectedMember}
        refreshMembers={refreshMembers}
      />
    </>
  );
};

/**
 * Skeleton Member Card for loading state
 */
const SkeletonMemberCard = () => (
  <div className="border border-gray-200 rounded-lg p-4 animate-pulse">
    <div className="flex items-start space-x-3 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1">
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
    <div className="h-10 bg-gray-200 rounded"></div>
  </div>
);

export default MembersListSection;
