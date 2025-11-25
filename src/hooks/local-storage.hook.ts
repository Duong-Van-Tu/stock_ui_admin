import { useEffect, useState } from 'react';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;

    try {
      const saved = window.localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to parse key "${key}"`, error);
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to set key "${key}"`, error);
    }
  }, [key, value]);

  const remove = () => {
    if (typeof window === 'undefined') return;

    try {
      window.localStorage.removeItem(key);
      setValue(defaultValue);
    } catch (error) {
      console.warn(`[useLocalStorage] Failed to remove key "${key}"`, error);
    }
  };

  return { value, setValue, remove };
}
