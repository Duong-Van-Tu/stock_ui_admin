'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = 'stock-ui-theme-mode';
const DEFAULT_THEME_MODE: ThemeMode = 'dark';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getInitialThemeMode = (): ThemeMode => {
  if (typeof window === 'undefined') return DEFAULT_THEME_MODE;

  const documentMode = document.documentElement.dataset.theme;
  if (documentMode === 'light' || documentMode === 'dark') {
    return documentMode;
  }

  const storedMode = window.localStorage.getItem(STORAGE_KEY);
  if (storedMode === 'light' || storedMode === 'dark') {
    return storedMode;
  }

  return DEFAULT_THEME_MODE;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  const value = useMemo(
    () => ({
      themeMode,
      isDarkMode: themeMode === 'dark',
      setThemeMode,
      toggleTheme: () =>
        setThemeMode((currentMode) =>
          currentMode === 'dark' ? 'light' : 'dark'
        )
    }),
    [themeMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useThemeMode must be used within ThemeProvider');
  }

  return context;
}
