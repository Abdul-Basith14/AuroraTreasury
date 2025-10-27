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

  const years = ['all', '1st', '2nd', '3rd', '4th'];

  const handleFilterUpdate = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <Filter className="w-5 h-5 text-gray-600" />
        <h3 className="font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Filter */}
        {showStatusFilter && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={filters.status || 'Pending'}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Pending">Pending</option>
              <option value="all">All Statuses</option>
            </select>
          </div>
        )}

        {/* Month Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Month
          </label>
          <select
            value={filters.month || ''}
            onChange={(e) => handleFilterUpdate('month', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Months</option>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>

        {/* Member Year Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Member Year
          </label>
          <select
            value={filters.year || 'all'}
            onChange={(e) => handleFilterUpdate('year', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year === 'all' ? 'All Years' : `${year} Year`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(filters.month || filters.year !== 'all') && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onFilterChange({ status: filters.status || 'Pending', month: '', year: 'all' })}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestFilters;
