import { useEffect, useRef } from 'react';

export function useDebouncedSave<T>(value: T, delay: number, onSave: (v: T) => void) {
  const first = useRef(true);
  useEffect(() => {
    const t = setTimeout(() => {
      if (first.current) { first.current = false; return; }
      onSave(value);
    }, delay);
    return () => clearTimeout(t);
  }, [value, delay, onSave]);
}
