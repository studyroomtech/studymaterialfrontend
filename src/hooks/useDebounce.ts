'use client';

// Generic debounce hook.
//
// Returns a debounced copy of `value` that only updates after the value has
// stopped changing for `delayMs`. Primarily used to debounce search input so
// filtering runs after the learner stops typing (Req 4.1).

import { useEffect, useState } from 'react';

import { DEFAULT_DEBOUNCE_DELAY_MS } from './useDebounce.constant';

export const useDebounce = <TValue>(
  value: TValue,
  delayMs: number = DEFAULT_DEBOUNCE_DELAY_MS,
): TValue => {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
};
