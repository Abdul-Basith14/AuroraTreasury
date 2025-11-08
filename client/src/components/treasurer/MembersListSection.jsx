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
  
  // --- Theme Tokens ---
  const TEXT_PRIMARY = '#F5F3E7';
  const TEXT_SECONDARY = '#E8E3C5';
  const ACCENT_OLIVE = '#A6C36F';
  const BACKGROUND_PRIMARY = '#0B0B09';
  const BACKGROUND_SECONDARY = '#1F221C';
  const BORDER_DIVIDER = '#3A3E36';
  // --------------------
  
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
          {[1, 2, 3, 4, 5, 6].map(i => <SkeletonMemberCard key={i} BORDER_DIVIDER={BORDER_DIVIDER} BACKGROUND_SECONDARY={BACKGROUND_SECONDARY} />)}
        </div>
      </div>
    );
  }
  
  // Empty State
  if (members.length === 0) {
    return (
      <div className="p-12 text-center">
        {/* Muted Icon */}
        <Users className={`w-16 h-16 text-[${BORDER_DIVIDER}]/80 mx-auto mb-4`} />
        {/* Primary Text */}
        <h3 className={`text-lg font-medium text-[${TEXT_PRIMARY}] mb-2`}>No Members Found</h3>
        {/* Secondary Text */}
        <p className={`text-[${TEXT_SECONDARY}]/80`}>
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
        {/* Muted Text for count */}
        <div className={`mb-4 text-sm text-[${TEXT_SECONDARY}]/60`}>
          Showing {members.length} member{members.length !== 1 ? 's' : ''}
        </div>
        
        {/* Display grouped by year when "All Years" is selected */}
        {selectedYear === 'all' && sortedYears.length > 0 ? (
          <div className="space-y-8">
            {sortedYears.map(year => (
              <div key={year}>
                {/* Year Header (Custom Divider/Pill Style) */}
                <div className="flex items-center mb-6">
                  {/* Muted Divider */}
                  <div className={`flex-1 border-t border-[${BORDER_DIVIDER}]/60`}></div>
                  <h3 className={`px-4 text-lg font-bold text-[${TEXT_PRIMARY}] bg-[${BACKGROUND_SECONDARY}] py-2 rounded-full border border-[${BORDER_DIVIDER}]`}>
                    {year}
                    {/* Muted Count Text */}
                    <span className={`ml-2 text-sm font-normal text-[${TEXT_SECONDARY}]/80`}>
                      ({groupedMembers[year].length} member{groupedMembers[year].length !== 1 ? 's' : ''})
                    </span>
                  </h3>
                  <div className={`flex-1 border-t border-[${BORDER_DIVIDER}]/60`}></div>
                </div>
                
                {/* Members Grid for this year */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedMembers[year].map(member => (
                    // MemberCard will need to be themed separately, but the structure is correct
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
 * Skeleton Member Card for loading state (Themed)
 */
const SkeletonMemberCard = ({ BORDER_DIVIDER, BACKGROUND_SECONDARY }) => (
  // Use Muted Background, Border, and Pulse for Skeleton
  <div className={`bg-[${BACKGROUND_SECONDARY}] border border-[${BORDER_DIVIDER}]/40 rounded-2xl p-4 animate-pulse`}>
    <div className="flex items-start space-x-3 mb-4">
      {/* Darker Muted Placeholder for Avatar */}
      <div className={`w-12 h-12 bg-[${BORDER_DIVIDER}]/50 rounded-full`}></div>
      <div className="flex-1">
        {/* Darker Muted Placeholder for Text */}
        <div className={`h-4 bg-[${BORDER_DIVIDER}]/50 rounded w-32 mb-2`}></div>
        <div className={`h-3 bg-[${BORDER_DIVIDER}]/50 rounded w-24`}></div>
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className={`h-3 bg-[${BORDER_DIVIDER}]/50 rounded w-full`}></div>
      <div className={`h-3 bg-[${BORDER_DIVIDER}]/50 rounded w-3/4`}></div>
    </div>
    {/* Darker Muted Placeholder for Button/Action */}
    <div className={`h-10 bg-[${BORDER_DIVIDER}]/50 rounded-xl`}></div>
  </div>
);

export default MembersListSection;