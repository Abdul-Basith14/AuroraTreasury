import React from 'react';

/**
 * Year Filter Tabs Component
 * Allows filtering members by academic year
 */
const YearFilterTabs = ({ selectedYear, onYearChange, membersByYear }) => {
  // Define available year options
  const years = [
    { value: 'all', label: 'All' },
    { value: '1st', label: '1st Year' },
    { value: '2nd', label: '2nd Year' },
    { value: '3rd', label: '3rd Year' },
    { value: '4th', label: '4th Year' }
  ];
  
  /**
   * Get member count for a specific year
   * @param {string} year - Year value
   * @returns {number} - Count of members
   */
  const getCount = (year) => {
    if (year === 'all') {
      return membersByYear.reduce((sum, item) => sum + item.count, 0);
    }
    const found = membersByYear.find(item => item.year === year);
    return found ? found.count : 0;
  };
  
  return (
    <div className="border-b border-gray-200">
      <div className="flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300">
        {years.map(year => (
          <button
            key={year.value}
            onClick={() => onYearChange(year.value)}
            className={`px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-200 ${
              selectedYear === year.value
                ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {year.label}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
              selectedYear === year.value
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              {getCount(year.value)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default YearFilterTabs;
