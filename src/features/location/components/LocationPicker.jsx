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
//
// prop `embedded`:
//   اگر true باشد → به صورت inline داخل TopBar نمایش داده می‌شود
//                    (بدون absolute، بدون top/left)
// ============================================
const LocationPicker = ({
  onLocationSelect,
  onSearchChange,
  embedded = false,
  selectedLocation = null,
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  const abortControllerRef = useRef(null);
  const skipNextSearchRef = useRef(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  // اگر selectedLocation عوض شد، query را همگام کن
  useEffect(() => {
    if (selectedLocation?.name) {
      // با setTimeout تا خارج از body effect باشد
      const t = setTimeout(() => {
        setQuery(selectedLocation.name);
      }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [selectedLocation]);

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

  // ============================================================
  // Debounced search
  // ============================================================
  useEffect(() => {
    const cleanQuery = query.trim();

    if (onSearchChange) onSearchChange(false);

    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return undefined;
    }

    if (cleanQuery.length < 2) {
      const clearTimer = setTimeout(() => {
        setSuggestions([]);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const searchTimer = setTimeout(() => {
      searchLocations(cleanQuery);
    }, 700);

    return () => clearTimeout(searchTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // بستن suggestions با کلیک بیرون
  useEffect(() => {
    if (suggestions.length === 0) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setSuggestions([]);
      }
    };
    const handleEscape = (e) => {
      if (e.key === 'Escape') setSuggestions([]);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [suggestions.length]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleSelect = (location) => {
    const finalLocation = { ...location, zoom: getSmartZoom(location) };
    skipNextSearchRef.current = true;
    setQuery(location.persianName || location.name);
    setSuggestions([]);
    onLocationSelect?.(finalLocation);
    if (onSearchChange) onSearchChange(false);
    inputRef.current?.blur();
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
    inputRef.current?.focus();
  };

  const showSuggestions = suggestions.length > 0;

  // ============================================================
  // Wrapper classes
  // ============================================================
  const wrapperClass = embedded
    ? 'relative w-full font-vazir'
    : 'absolute top-4 left-1/2 -translate-x-1/2 z-[1200] w-[min(520px,calc(100%-24px))] font-vazir';

  return (
    <div ref={containerRef} className={wrapperClass} dir="rtl">
      <form
        onSubmit={handleSubmit}
        className={`
          flex items-center gap-1.5 p-1.5
          rounded-2xl
          bg-white/75 backdrop-blur-xl
          border border-white/70
          transition-shadow duration-200
          ${
            focused
              ? 'shadow-[0_8px_32px_rgba(31,38,135,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]'
              : 'shadow-[0_4px_20px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]'
          }
        `}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSuggestions([]);
                inputRef.current?.blur();
              }
            }}
            placeholder="جستجوی شهر، روستا یا منطقه..."
            aria-label="جستجوی مکان"
            className="
              w-full pr-9 pl-9 py-2
              bg-transparent border-none outline-none
              text-sm text-slate-800 placeholder:text-slate-400
              font-vazir
            "
          />
          <Search
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="
                absolute left-2 top-1/2 -translate-y-1/2
                p-1 rounded-md
                text-slate-400 hover:bg-white/70 hover:text-slate-700
                transition-colors cursor-pointer
              "
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
            w-9 h-9 flex items-center justify-center
            bg-primary-600 text-white rounded-xl
            shadow-[0_2px_8px_rgba(46,125,50,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]
            hover:bg-primary-700 transition-colors
            disabled:opacity-60 disabled:cursor-wait
            cursor-pointer shrink-0
          "
        >
          {isSearching ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Search size={16} />
          )}
        </button>
      </form>

      {showSuggestions && (
        <div
          className="
            absolute top-full left-0 right-0 mt-2 z-[1200]
            max-h-72 overflow-y-auto
            rounded-2xl
            bg-white/95 backdrop-blur-xl
            border border-white/70
            shadow-[0_8px_32px_rgba(31,38,135,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]
            overflow-hidden
            animate-panel-fade-in
          "
        >
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
                  border-b border-slate-200/50 last:border-0
                  hover:bg-primary-50/70 transition-colors
                  cursor-pointer
                "
              >
                <div className="flex items-center gap-2 w-full">
                  <MapPin
                    size={14}
                    className="text-primary-600 flex-shrink-0"
                  />
                  <strong className="text-sm font-bold text-slate-800 truncate">
                    {title.trim()}
                  </strong>
                </div>
                {rest.length > 0 && (
                  <span className="text-xs text-slate-500 truncate w-full pr-6">
                    {rest.slice(0, 3).join('، ').trim()}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(LocationPicker);