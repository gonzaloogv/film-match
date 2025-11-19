/**
 * SearchBar Component
 *
 * Search input field with debouncing
 * Handles search query updates with 500ms debounce
 */

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { useFiltersContext } from '../../../context/filters/useFiltersContext';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';

interface SearchBarProps {
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Buscar películas...',
}) => {
  const { criteria, updateSearch } = useFiltersContext();
  const [localValue, setLocalValue] = useState(criteria.search);
  const debouncedValue = useDebouncedValue(localValue, 500);

  // Update context when debounced value changes
  useEffect(() => {
    updateSearch(debouncedValue);
  }, [debouncedValue, updateSearch]);

  // Update local value when criteria changes (e.g., from URL)
  useEffect(() => {
    setLocalValue(criteria.search);
  }, [criteria.search]);

  const handleClear = () => {
    setLocalValue('');
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <SearchIcon className="absolute left-3 xs:left-4 w-4 xs:w-5 h-4 xs:h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          placeholder={placeholder}
          className="input-field pl-10 xs:pl-12 pr-10 xs:pr-12 text-xs xs:text-sm sm:text-base w-full"
        />
        {localValue && (
          <button
            onClick={handleClear}
            className="absolute right-3 xs:right-4 text-gray-400 hover:text-gray-200 transition-colors"
            aria-label="Limpiar búsqueda"
          >
            <X className="w-4 xs:w-5 h-4 xs:h-5" />
          </button>
        )}
      </div>
    </div>
  );
};
