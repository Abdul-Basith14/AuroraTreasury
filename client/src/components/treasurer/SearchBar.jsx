import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Search Bar Component
 * Provides search functionality with debouncing
 */
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  /**
   * Handle search input with debouncing
   * @param {string} value - Search query
   */
  const handleSearch = (value) => {
    setQuery(value);
    
    // Debounce the search to avoid too many API calls
    clearTimeout(window.searchTimeout);
    window.searchTimeout = setTimeout(() => {
      onSearch(value);
    }, 500); // Wait 500ms after user stops typing
  };
  
  /**
   * Clear search query
   */
  const handleClear = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name, USN, or email..."
        className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
