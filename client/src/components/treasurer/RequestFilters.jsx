import React from 'react';
import { Filter } from 'lucide-react';

// --- Core Color Palette (from Styling System) ---
const BACKGROUND_PRIMARY = '#0B0B09';
const BACKGROUND_SECONDARY = '#1F221C';
const TEXT_PRIMARY = '#F5F3E7';
const TEXT_SECONDARY = '#E8E3C5';
const ACCENT_OLIVE = '#A6C36F';
const BORDER_DIVIDER = '#3A3E36';
const SHADOW_GLOW = 'shadow-[0_0_25px_rgba(166,195,111,0.08)]';
// ------------------------------------------------

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
    // Themed Container
    <div className={`bg-[${BACKGROUND_SECONDARY}] rounded-xl p-6 border border-[${BORDER_DIVIDER}] ${SHADOW_GLOW}`}>
      <div className="flex items-center space-x-2 mb-4 border-b border-[${BORDER_DIVIDER}]/50 pb-4">
        <Filter className={`w-5 h-5 text-[${ACCENT_OLIVE}]`} />
        <h3 className={`font-bold text-[${TEXT_PRIMARY}] text-lg`}>Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>
              Status
            </label>
            <select
              value={filters.status || 'Pending'}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              // Themed Select
              className={`w-full px-4 py-2 border border-[${BORDER_DIVIDER}] rounded-lg focus:ring-2 focus:ring-[${ACCENT_OLIVE}] focus:border-[${ACCENT_OLIVE}]/50 bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}]`}
            >
              <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="Pending">Pending</option>
              <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="all">All Statuses</option>
            </select>
          </div>
        )}

        {/* Month Filter */}
        <div>
          <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>
            Month
          </label>
          <select
            value={filters.month || ''}
            onChange={(e) => handleFilterUpdate('month', e.target.value)}
            // Themed Select
            className={`w-full px-4 py-2 border border-[${BORDER_DIVIDER}] rounded-lg focus:ring-2 focus:ring-[${ACCENT_OLIVE}] focus:border-[${ACCENT_OLIVE}]/50 bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}]`}
          >
            <option className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`} value="">All Months</option>
            {months.map((month) => (
              <option 
                key={month} 
                value={month} 
                className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`}
              >
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Member Year Filter */}
        <div>
          <label className={`block text-sm font-medium text-[${TEXT_SECONDARY}] mb-2`}>
            Member Year
          </label>
          <select
            value={filters.year || 'all'}
            onChange={(e) => handleFilterUpdate('year', e.target.value)}
            // Themed Select
            className={`w-full px-4 py-2 border border-[${BORDER_DIVIDER}] rounded-lg focus:ring-2 focus:ring-[${ACCENT_OLIVE}] focus:border-[${ACCENT_OLIVE}]/50 bg-[${BACKGROUND_PRIMARY}] text-[${TEXT_PRIMARY}]`}
          >
            {years.map((year) => (
              <option 
                key={year} 
                value={year}
                className={`bg-[${BACKGROUND_SECONDARY}] text-[${TEXT_PRIMARY}]`}
              >
                {year === 'all' ? 'All Years' : `${year} Year`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.month || filters.year !== 'all') && (
        <div className="mt-4 flex justify-end pt-4 border-t border-[${BORDER_DIVIDER}]/50">
          <button
            onClick={() => onFilterChange({ status: filters.status || 'Pending', month: '', year: 'all' })}
            // Themed Clear Button
            className={`text-sm text-[${ACCENT_OLIVE}] hover:text-white hover:bg-[${ACCENT_OLIVE}]/20 p-2 rounded-lg font-medium transition`}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;