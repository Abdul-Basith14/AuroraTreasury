import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

/**
 * Search Bar Component
 * Provides search functionality with debouncing
 */
const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  // --- Theme Tokens ---
  const BACKGROUND_SECONDARY = '#1F221C';
  const TEXT_PRIMARY = '#F5F3E7';
  const TEXT_SECONDARY = '#E8E3C5';
  const ACCENT_OLIVE = '#A6C36F';
  const BORDER_DIVIDER = '#3A3E36';
  // --------------------
  
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
      {/* Search Icon - Positioned and set to Muted/Accent tone */}
      <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[${ACCENT_OLIVE}]/70`} />
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search by name, USN, or email..."
        // Input Styling: Panel background, Primary text color, Muted border, Olive focus ring
        className={`
          w-full pl-12 pr-12 py-3 
          border border-[${BORDER_DIVIDER}] 
          rounded-2xl 
          bg-[${BACKGROUND_SECONDARY}] 
          text-[${TEXT_PRIMARY}] 
          placeholder:text-[${TEXT_SECONDARY}]/60
          focus:ring-2 focus:ring-[${ACCENT_OLIVE}] focus:border-transparent 
          transition-all duration-200 outline-none
        `}
        // Added rounded-2xl for theme consistency
      />
      {query && (
        <button
          onClick={handleClear}
          // Clear Button: Muted icon, slightly brighter hover
          className={`absolute right-4 top-1/2 transform -translate-y-1/2 text-[${TEXT_SECONDARY}]/60 hover:text-[${TEXT_SECONDARY}] transition-colors duration-200`}
          aria-label="Clear search"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;