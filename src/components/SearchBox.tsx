import React, { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { searchLocations } from '../utils/api';
import type { LocationSuggestion } from '../types/location';

interface SearchBoxProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export function SearchBox({ onLocationSelect }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setIsLoading(true);
      setShowDropdown(true);
      try {
        const results = await searchLocations(query);
        if (results.error) {
          console.error(results.error);
          setSuggestions([]);
        } else {
          setSuggestions(results.data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.name.toLowerCase().includes(query.toLowerCase()) ||
    (suggestion.state?.toLowerCase().includes(query.toLowerCase())) ||
    suggestion.country.toLowerCase().includes(query.toLowerCase())
  );

  const handleLocationSelect = (location: LocationSuggestion) => {
    setQuery(`${location.name}${location.state ? `, ${location.state}` : ''}, ${location.country}`);
    setShowDropdown(false);
    onLocationSelect(location.lat, location.lon);
  };

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-10 w-[calc(100%-2rem)] max-w-md px-2 sm:px-0"
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a location..."
          className="w-full px-4 py-2 sm:py-3 pl-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg 
                   border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50
                   rounded-b-lg transition-all duration-200 hover:shadow-xl"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        
        {showDropdown && query.trim() !== '' && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-sm 
                        rounded-lg shadow-lg max-h-60 overflow-auto border border-gray-100
                        animate-fadeIn">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : filteredSuggestions.length > 0 ? (
              <ul className="py-2">
                {filteredSuggestions.map((suggestion, index) => (
                  <li
                    key={`${suggestion.lat}-${suggestion.lon}-${index}`}
                    onClick={() => handleLocationSelect(suggestion)}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex flex-col 
                             transition-all duration-200 hover:pl-6"
                  >
                    <span className="font-medium">{suggestion.name}</span>
                    <span className="text-sm text-gray-500">
                      {suggestion.state && `${suggestion.state}, `}{suggestion.country}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-gray-500">No results found</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}