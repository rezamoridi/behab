// src/shared/hooks/useSessionState.js
import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useSessionState
 *
 * مثل useState ولی مقدار را در sessionStorage نگه می‌دارد.
 * + همگام‌سازی بین کامپوننت‌ها در همان tab (با custom event)
 *
 * ⚠️ مهم: برای جلوگیری از "Cannot update component during render":
 *   - dispatchEvent در setTimeout(0) → بعد از commit
 *   - setState در listener با queueMicrotask → بعد از render فعلی
 */
const SYNC_EVENT_PREFIX = 'session-state-sync:';

export const useSessionState = (key, initialValue) => {
  const [value, setValueInternal] = useState(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;
    }
  });

  // ✅ برای تشخیص مقدار قبلی در listener
  const valueRef = useRef(value);
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  // ✅ wrapper که sessionStorage + custom event را با هم به‌روز می‌کند
  const setValue = useCallback(
    (updater) => {
      setValueInternal((prev) => {
        const next =
          typeof updater === 'function' ? updater(prev) : updater;

        // ✅ نوشتن در sessionStorage (sync)
        try {
          if (typeof window !== 'undefined') {
            if (next === undefined) {
              sessionStorage.removeItem(key);
            } else {
              sessionStorage.setItem(key, JSON.stringify(next));
            }

            // ✅ broadcast در tick جدا — بعد از commit
            // (بدون این defer، اگر در حین render کامپوننت دیگری
            //  listener صدا زده شود، setState در حین render رخ می‌دهد)
            setTimeout(() => {
              try {
                window.dispatchEvent(
                  new CustomEvent(`${SYNC_EVENT_PREFIX}${key}`, {
                    detail: { value: next },
                  })
                );
              } catch {
                /* ignore */
              }
            }, 0);
          }
        } catch {
          /* quota یا حالت خصوصی */
        }

        return next;
      });
    },
    [key]
  );

  // ✅ sync از sessionStorage (بین tabs — storage event)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorage = (e) => {
      if (e.storageArea !== sessionStorage) return;
      if (e.key !== key) return;
      try {
        const next =
          e.newValue !== null ? JSON.parse(e.newValue) : initialValue;

        // ✅ defer برای جلوگیری از setState در حین render
        queueMicrotask(() => {
          setValueInternal(next);
        });
      } catch {
        /* ignore */
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // ✅ sync در همان tab — custom event
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleSync = (e) => {
      const nextValue = e.detail?.value;
      // ✅ فقط اگر مقدار جدید متفاوت است set کن
      if (JSON.stringify(nextValue) !== JSON.stringify(valueRef.current)) {
        // ✅ defer — بعد از render فعلی
        queueMicrotask(() => {
          setValueInternal(nextValue);
        });
      }
    };

    window.addEventListener(`${SYNC_EVENT_PREFIX}${key}`, handleSync);
    return () =>
      window.removeEventListener(`${SYNC_EVENT_PREFIX}${key}`, handleSync);
  }, [key]);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
      // ✅ defer
      setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent(`${SYNC_EVENT_PREFIX}${key}`, {
            detail: { value: initialValue },
          })
        );
      }, 0);
    } catch {
      /* ignore */
    }
    setValueInternal(initialValue);
  }, [key, initialValue]);

  return [value, setValue, clear];
};

export default useSessionState;