// src/shared/hooks/useLocalStorageState.js
import { useState, useEffect, useCallback } from 'react';

/**
 * useLocalStorageState
 *
 * مثل useState ولی مقدار را در localStorage نگه می‌دارد.
 * برای ترجیحات پایدار کاربر (بین session ها).
 */
export const useLocalStorageState = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      if (value === undefined) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch {
      /* quota */
    }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    setValue(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
};

export default useLocalStorageState;