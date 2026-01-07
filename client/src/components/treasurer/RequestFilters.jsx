import React from 'react';
import { Filter } from 'lucide-react';

/**
 * Request Filters - Filter component for payment requests
 */
const RequestFilters = ({ filters, onFilterChange, showStatusFilter = true }) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Note: 'all' is kept for the 'All Years' option. The other values are mapped from 1st, 2nd, etc. 
  // Ensure these match the values used by the API and ReimbursementRequestsPage (e.g., '1st Year').
  // For simplicity here, I'll use the short version but ensure the label is descriptive.
  const years = ['all', '1st', '2nd', '3rd', '4th']; 

  const handleFilterUpdate = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl rounded-xl p-6 border border-[#A6C36F]/20 shadow-[0_0_25px_rgba(166,195,111,0.08)]">
      <div className="flex items-center space-x-2 mb-4 border-b border-[#A6C36F]/20 pb-4">
        <Filter className="w-5 h-5 text-[#A6C36F]" />
        <h3 className="font-bold text-[#F5F3E7] text-lg">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
              Status
            </label>
            <select
              value={filters.status || 'Pending'}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent bg-black/40 text-[#F5F3E7] outline-none"
            >
              <option className="bg-[#1F221C] text-[#F5F3E7]" value="Pending">Pending</option>
              <option className="bg-[#1F221C] text-[#F5F3E7]" value="all">All Statuses</option>
            </select>
          </div>
        )}

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
            Month
          </label>
          <select
            value={filters.month || ''}
            onChange={(e) => handleFilterUpdate('month', e.target.value)}
            className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent bg-black/40 text-[#F5F3E7] outline-none"
          >
            <option className="bg-[#1F221C] text-[#F5F3E7]" value="">All Months</option>
            {months.map((month) => (
              <option 
                key={month} 
                value={month} 
                className="bg-[#1F221C] text-[#F5F3E7]"
              >
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Member Year Filter */}
        <div>
          <label className="block text-sm font-medium text-[#E8E3C5] mb-2">
            Member Year
          </label>
          <select
            value={filters.year || 'all'}
            onChange={(e) => handleFilterUpdate('year', e.target.value)}
            className="w-full px-4 py-2 border border-[#A6C36F]/20 rounded-lg focus:ring-2 focus:ring-[#A6C36F] focus:border-transparent bg-black/40 text-[#F5F3E7] outline-none"
          >
            {years.map((year) => (
              <option 
                key={year} 
                value={year}
                className="bg-[#1F221C] text-[#F5F3E7]"
              >
                {year === 'all' ? 'All Years' : `${year} Year`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.month || filters.year !== 'all') && (
        <div className="mt-4 flex justify-end pt-4 border-t border-[#A6C36F]/20">
          <button
            onClick={() => onFilterChange({ status: filters.status || 'Pending', month: '', year: 'all' })}
            className="text-sm text-[#A6C36F] hover:text-[#F5F3E7] hover:bg-[#A6C36F]/20 p-2 rounded-lg font-medium transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;