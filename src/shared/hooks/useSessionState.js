// src/shared/hooks/useSessionState.js
import { useState, useEffect, useCallback } from 'react';

/**
 * useSessionState
 *
 * مثل useState ولی مقدار را در sessionStorage نگه می‌دارد.
 * - بعد از refresh یا back/forward مرورگر، مقدار برمی‌گردد.
 * - با بستن تب، پاک می‌شود.
 * - بین تب‌های مختلف مشترک نیست.
 *
 * @param {string} key - کلید ذخیره‌سازی
 * @param {*} initialValue - مقدار اولیه
 */
export const useSessionState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // sync به sessionStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (value === undefined) {
        sessionStorage.removeItem(key);
      } else {
        sessionStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      /* quota یا حالت خصوصی */
    }
  }, [key, value]);

  // sync از sessionStorage اگر تب دیگری نوشت (معمولاً اتفاق نمی‌افتد چون sessionStorage مشترک نیست،
  // ولی اگر کسی مستقیم setItem کند، این کمک می‌کند)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key !== key) return;
      try {
        setValue(e.newValue !== null ? JSON.parse(e.newValue) : initialValue);
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
};

export default useSessionState;