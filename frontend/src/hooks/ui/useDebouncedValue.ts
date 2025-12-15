import { useState, useEffect } from 'react';
import { TIMING } from '@/lib/constants';

interface UseDebouncedValueReturn<T> {
  value: T;
}

/**
 * Hook for debouncing a value
 */
export function useDebouncedValue<T>(
  value: T,
  delay: number = TIMING.DEBOUNCE_DELAY
): UseDebouncedValueReturn<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return { value: debouncedValue };
}
