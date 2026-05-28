import { useState, useEffect } from "react";

/**
 * useDebounce — delays updating a value until after a specified delay.
 *
 * @param value - The raw value to debounce
 * @param delayMs - Debounce delay in milliseconds (default: 300)
 * @returns The debounced value
 *
 * @example
 * const [query, setQuery] = useState("");
 * const debouncedQuery = useDebounce(query, 200);
 */
export function useDebounce<T>(value: T, delayMs: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
