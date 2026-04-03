'use client';

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import {
  DEFAULT_THEME_MODE,
  isThemeMode,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  ThemeMode
} from '@/constants/theme.constant';

type ThemeContextValue = {
  themeMode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getInitialThemeMode = (
  initialThemeMode: ThemeMode = DEFAULT_THEME_MODE
): ThemeMode => {
  if (typeof window === 'undefined') return initialThemeMode;

  const documentMode = document.documentElement.dataset.theme;
  if (isThemeMode(documentMode)) {
    return documentMode;
  }

  const storedMode = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (isThemeMode(storedMode)) {
    return storedMode;
  }

  return initialThemeMode;
};

export function ThemeProvider({
  children,
  initialThemeMode = DEFAULT_THEME_MODE
}: {
  children: ReactNode;
  initialThemeMode?: ThemeMode;
}) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() =>
    getInitialThemeMode(initialThemeMode)
  );

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.style.colorScheme = themeMode;
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
    document.cookie = `${THEME_COOKIE_KEY}=${themeMode}; path=/; max-age=31536000; samesite=lax`;
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
