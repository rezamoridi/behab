// src/features/location/components/LocationPicker.jsx
import React, { useEffect, useRef, useState } from "react";
import { Search, X, MapPin, Loader2, Wand2, Check } from "lucide-react";

// ============================================
// ✅ Toast bridge — بدون نیاز به useToast hook
// (چون LocationPicker ممکن است خارج از ToastProvider باشد)
// ============================================
const showToast = (type, message, title) => {
  try {
    window.dispatchEvent(
      new CustomEvent("app:toast", {
        detail: { type, message, title },
      }),
    );
  } catch (err) {
    console.warn("app:toast dispatch failed:", err);
  }
};

// ============================================
// Helpers
// ============================================
const getSmartZoom = (item) => {
  if (item.type === "city" || item.importance > 0.7) return 12;
  if (item.type === "town" || item.importance > 0.5) return 14;
  if (item.type === "village" || item.importance > 0.3) return 16;
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

  const province = address.state || address.province || address.region || "";
  const county = address.county || address.city || address.town || "";
  const bakhsh =
    address.district || address.municipality || address.county || "";
  const dehestan =
    address.suburb ||
    address.neighbourhood ||
    address.city ||
    address.town ||
    "";
  const village =
    address.village || address.hamlet || address.village_cleansed || "";
  const city = address.city || address.town || "";

  return {
    name: persianName,
    lat: Number(item.lat),
    lon: Number(item.lon),
    type: item.type || "",
    importance: Number(item.importance || 0),
    source: "عمومی",
    province,
    county,
    bakhsh: bakhsh || "",
    dehestan: dehestan || "",
    village: village || "",
    city,
    town: address.town || "",
    suburb: address.suburb || "",
    neighbourhood: address.neighbourhood || "",
    hamlet: address.hamlet || "",
    municipality: address.municipality || "",
    district: address.district || "",
    displayName: item.display_name,
    persianName,
  };
};

// ============================================
// Component
// ============================================
const LocationPicker = ({
  onLocationSelect,
  onSearchChange,
  embedded = false,
  selectedLocation = null,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [focused, setFocused] = useState(false);

  // ✅ فاز ۴: بازخورد بصری اتوفیل
  const [appliedId, setAppliedId] = useState(null);

  const abortControllerRef = useRef(null);
  const skipNextSearchRef = useRef(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const lastSelectedRef = useRef(null);
  const userEditedRef = useRef(false);

  useEffect(() => {
    if (selectedLocation?.name) {
      skipNextSearchRef.current = true;
      setQuery(selectedLocation.name);
      lastSelectedRef.current = selectedLocation;
      userEditedRef.current = false;
    }
  }, [selectedLocation]);

  // ============================================================
  // searchLocations
  // ============================================================
  const searchLocations = async (searchText) => {
    const cleanQuery = searchText.trim();

    if (cleanQuery.length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return [];
    }

    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;
    setIsSearching(true);

    try {
      const params = new URLSearchParams({
        format: "json",
        q: `${cleanQuery} Iran`,
        limit: "8",
        addressdetails: "1",
        "accept-language": "fa",
        namedetails: "1",
        extratags: "1",
      });

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        },
      );

      if (!response.ok) throw new Error("خطا در دریافت نتایج جستجو");

      const data = await response.json();
      const results = data
        .map(normalizeResult)
        .filter(
          (item) => Number.isFinite(item.lat) && Number.isFinite(item.lon),
        );

      if (!controller.signal.aborted) {
        setSuggestions(results);
        setIsSearching(false);
      }
      return results;
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("خطای جستجوی مکان:", error);
        if (!controller.signal.aborted) {
          setSuggestions([]);
          setIsSearching(false);
        }
      }
      return [];
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

    if (userEditedRef.current) {
      lastSelectedRef.current = null;
      userEditedRef.current = false;
    }

    if (cleanQuery.length < 2) {
      const clearTimer = setTimeout(() => {
        setSuggestions([]);
        setIsSearching(false);
      }, 0);
      return () => clearTimeout(clearTimer);
    }

    const searchTimer = setTimeout(() => {
      searchLocations(cleanQuery);
    }, 400);

    return () => {
      clearTimeout(searchTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ============================================================
  // کلیک بیرون
  // ============================================================
  useEffect(() => {
    if (suggestions.length === 0) return;

    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setSuggestions([]);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [suggestions.length]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // ============================================================
  // handleSelect
  // ============================================================
  const handleSelect = (location) => {
    const finalLocation = { ...location, zoom: getSmartZoom(location) };

    skipNextSearchRef.current = true;
    userEditedRef.current = false;
    lastSelectedRef.current = finalLocation;

    setQuery(location.persianName || location.name);
    setSuggestions([]);
    setIsSearching(false);
    abortControllerRef.current?.abort();

    onLocationSelect?.(finalLocation);

    if (onSearchChange) onSearchChange(false);
    inputRef.current?.blur();
  };

  // ============================================================
  // ✅ فاز ۴: اتوفیل روی فرم
  // ============================================================
  const handleApplyToForm = (location) => {
    // ۱. انتخاب روی picker و نقشه
    handleSelect(location);

    // ۲. ارسال به LocationSection
    window.dispatchEvent(
      new CustomEvent("location:apply-to-form", {
        detail: {
          location: { ...location, zoom: getSmartZoom(location) },
        },
      }),
    );

    // ۳. بازخورد بصری
    const id = `${location.lat}-${location.lon}`;
    setAppliedId(id);
    setTimeout(() => setAppliedId(null), 1500);
  };

  // ============================================================
  // handleSubmit
  // ============================================================
  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanQuery = query.trim();

    const cached = lastSelectedRef.current;
    if (cached) {
      const cachedText = (cached.persianName || cached.name || "").trim();
      const cachedDisplay = (cached.displayName || "").trim();

      if (cleanQuery === cachedText || cleanQuery === cachedDisplay) {
        handleSelect(cached);
        return;
      }
    }

    if (cleanQuery.length < 2) {
      return;
    }

    const results = await searchLocations(cleanQuery);

    if (results.length === 0) {
      // ✅ جایگزین toast با bridge
      showToast(
        "warning",
        "مکانی با این نام پیدا نشد. عبارت دیگری امتحان کنید.",
        "نتیجه‌ای یافت نشد",
      );
      return;
    }

    const bestMatch = [...results].sort(
      (first, second) => second.importance - first.importance,
    )[0];
    handleSelect(bestMatch);
  };

  const handleClear = () => {
    abortControllerRef.current?.abort();
    lastSelectedRef.current = null;
    userEditedRef.current = false;
    setQuery("");
    setSuggestions([]);
    setIsSearching(false);
    inputRef.current?.focus();
  };

  const handleInputChange = (e) => {
    userEditedRef.current = true;
    setQuery(e.target.value);
  };

  const showSuggestions = suggestions.length > 0;

  const wrapperClass = embedded
    ? "relative w-full font-vazir"
    : "absolute top-4 left-1/2 -translate-x-1/2 z-[1200] w-[min(520px,calc(100%-24px))] font-vazir";

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
              ? "shadow-[0_8px_32px_rgba(31,38,135,0.18),inset_0_1px_0_rgba(255,255,255,0.95)]"
              : "shadow-[0_4px_20px_rgba(31,38,135,0.12),inset_0_1px_0_rgba(255,255,255,0.9)]"
          }
        `}
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
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
            const [title, ...rest] = displayName.split(",");
            const itemKey = `${item.lat}-${item.lon}-${index}`;
            const isApplied = appliedId === `${item.lat}-${item.lon}`;

            return (
              <div
                key={itemKey}
                className="
                  flex items-stretch
                  border-b border-slate-200/50 last:border-0
                  hover:bg-primary-50/40 transition-colors
                "
              >
                {/* ─── ناحیه انتخاب (کلیک = انتخاب روی نقشه) ─── */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  className="
                    flex-1 flex flex-col items-start gap-1
                    px-3 py-2.5 text-right cursor-pointer
                    min-w-0
                  "
                  title="انتخاب روی نقشه"
                >
                  <div className="flex items-center gap-2 w-full">
                    <MapPin
                      size={13}
                      className="text-primary-600 flex-shrink-0"
                    />
                    <strong className="text-[13px] font-bold text-slate-800 truncate">
                      {title.trim()}
                    </strong>
                  </div>
                  {rest.length > 0 && (
                    <span className="text-[11px] text-slate-500 truncate w-full pr-5">
                      {rest.slice(0, 3).join("، ").trim()}
                    </span>
                  )}
                </button>

                {/* ─── ✅ دکمه اتوفیل ─── */}
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApplyToForm(item);
                  }}
                  className={`
                    flex flex-col items-center justify-center gap-0.5
                    px-2.5 min-w-[56px]
                    text-[10px] font-bold
                    border-r border-slate-200/50
                    transition-colors cursor-pointer
                    ${
                      isApplied
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-white/40 text-primary-700 hover:bg-primary-50 hover:text-primary-800"
                    }
                  `}
                  title="اتوفیل: پر کردن خودکار فرم"
                >
                  {isApplied ? (
                    <Check size={14} strokeWidth={2.6} />
                  ) : (
                    <Wand2 size={14} strokeWidth={2.4} />
                  )}
                  <span className="leading-none">
                    {isApplied ? "فیل شد" : "اتوفیل"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(LocationPicker);