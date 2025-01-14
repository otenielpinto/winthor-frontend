"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export function useDebounce<T>(value: T, delay?: number): [T, (newValue: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const debounce = useCallback((newValue: T) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => setDebouncedValue(newValue), delay || 500);
  }, [delay]);

  useEffect(() => {
    debounce(value);
  }, [value, debounce]);

  return [debouncedValue, debounce];
}
