'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'archiquill_free_trial_count';
export const FREE_TRIAL_LIMIT = 3;

export function useFreeTrialCounter() {
  const [count, setCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setCount(raw ? Math.max(0, Number.parseInt(raw, 10) || 0) : 0);
    } catch {
      setCount(0);
    }
    setHydrated(true);
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCount(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const remaining = Math.max(0, FREE_TRIAL_LIMIT - count);
  const isExhausted = count >= FREE_TRIAL_LIMIT;

  return { count, remaining, isExhausted, increment, reset, hydrated };
}
