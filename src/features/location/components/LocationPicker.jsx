// src/features/location/components/LocationPicker.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';

// ============================================
// Helpers
// ============================================
const getSmartZoom = (item) => {
  if (item.type === 'city' || item.importance > 0.7) return 12;
  if (item.type === 'town' || item.importance > 0.5) return 14;
  if (item.type === 'village' || item.importance > 0.3) return 16;
  return 18;
};

const normalizeResult = (item) => {
  const address = item.address || {};
  const nameDetails = item.namedetails || {};

  const persianName =
    nameDetails.name_fa ||
    nameDetails.fa ||
    address.name_fa ||
    address.fa ||
    item.display_name;

  const province = address.state || address.province || address.region || '';
  const county = address.county || address.city || address.town || '';
  const bakhsh =
    address.district || address.municipality || address.county || '';
  const dehestan =
    address.suburb ||
    address.neighbourhood ||
    address.city ||
    address.town ||
    '';
  const village =
    address.village || address.hamlet || address.village_cleansed || '';
  const city = address.city || address.town || '';

  return {
    name: persianName,
    lat: Number(item.lat),
    lon: Number(item.lon),
    type: item.type || '',
    importance: Number(item.importance || 0),
    source: 'عمومی',
    province,
    county,
    bakhsh: bakhsh || '',
    dehestan: dehestan || '',
    village: village || '',
    city,
    town: address.town || '',
    suburb: address.suburb || '',
    neighbourhood: address.neighbourhood || '',
    hamlet: address.hamlet || '',
    municipality: address.municipality || '',
    district: address.district || '',
    displayName: item.display_name,
    persianName,
  };
};

// ============================================
// Component
// ============================================
const LocationPicker = ({ onLocationSelect, onSearchChange }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const abortControllerRef = useRef(null);
  const skipNextSearchRef = useRef(false);

  const searchLocations = async (searchText) => {
    const cleanQuery = searchText.trim();

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      return [];
    }

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        format: 'json',
        q: `${cleanQuery} Iran`,
        limit: '8',
        addressdetails: '1',
        'accept-language': 'fa',
        namedetails: '1',
        extratags: '1',
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
        }
      );

      if (!response.ok) throw new Error('خطا در دریافت نتایج جستجو');

      const data = await response.json();
      const results = data
        .map(normalizeResult)
        .filter(
          (item) =>
            Number.isFinite(item.lat) && Number.isFinite(item.lon)
        );

      setSuggestions(results);
      return results;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('خطای جستجوی مکان:', error);
        setSuggestions([]);
      }
      return [];
    } finally {
      if (!controller.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  useEffect(() => {
    const cleanQuery = query.trim();
    if (onSearchChange) onSearchChange(false);

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return undefined;
    }

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      return undefined;
    }

    const timer = setTimeout(() => {
      searchLocations(cleanQuery);
    }, 700);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSelect = (location) => {
    const selectedLocation = { ...location, zoom: getSmartZoom(location) };
    skipNextSearchRef.current = true;
    setQuery(location.persianName || location.name);
    setSuggestions([]);
    onLocationSelect?.(selectedLocation);
    if (onSearchChange) onSearchChange(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const results = await searchLocations(query);
    if (results.length === 0) {
      window.alert('مکانی با این نام یافت نشد.');
      return;
    }
    const bestMatch = [...results].sort(
      (first, second) => second.importance - first.importance
    )[0];
    handleSelect(bestMatch);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  return (
    <section
      className="absolute top-4 left-1/2 -translate-x-1/2 z-[1200] w-[min(460px,calc(100%-32px))] font-vazir"
      dir="rtl"
    >
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-200 rounded-xl shadow-lg"
      >
        <div className="relative flex-1">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setSuggestions([]);
            }}
            placeholder="جستجوی شهر، روستا یا منطقه..."
            aria-label="جستجوی مکان"
            className="w-full pr-9 pl-9 py-2.5 bg-transparent border-none outline-none text-sm text-gray-800 placeholder:text-gray-400"
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="پاک کردن"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isSearching}
          aria-label="جستجو"
          className="
            w-10 h-10 flex items-center justify-center
            bg-primary-600 text-white rounded-lg
            hover:bg-primary-700 transition-colors
            disabled:opacity-60 disabled:cursor-wait
          "
        >
          {isSearching ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-2 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg">
          {suggestions.map((item, index) => {
            const displayName = item.persianName || item.name;
            const [title, ...rest] = displayName.split(',');
            return (
              <button
                key={`${item.lat}-${item.lon}-${index}`}
                type="button"
                onClick={() => handleSelect(item)}
                className="
                  w-full flex flex-col items-start gap-1
                  px-4 py-3 text-right
                  bg-white border-b border-gray-100 last:border-0
                  hover:bg-primary-50 transition-colors
                  cursor-pointer
                "
              >
                <div className="flex items-center gap-2 w-full">
                  <MapPin size={14} className="text-primary-600 flex-shrink-0" />
                  <strong className="text-sm font-bold text-gray-800 truncate">
                    {title.trim()}
                  </strong>
                </div>
                {rest.length > 0 && (
                  <span className="text-xs text-gray-500 truncate w-full pr-6">
                    {rest.slice(0, 3).join('، ').trim()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default React.memo(LocationPicker);