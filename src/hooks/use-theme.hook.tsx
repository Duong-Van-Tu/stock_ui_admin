import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from 'react';
import { THEME_MODES, THEME_STORAGE_KEY, type ThemeMode } from '../constants/theme.constants';

type ThemeContextValue = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleThemeMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getInitialThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return THEME_MODES.light;
  }

  const savedThemeMode = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (savedThemeMode === THEME_MODES.dark || savedThemeMode === THEME_MODES.light) {
    return savedThemeMode;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEME_MODES.dark
    : THEME_MODES.light;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
  }, [themeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        toggleThemeMode: () =>
          setThemeMode((currentThemeMode) =>
            currentThemeMode === THEME_MODES.dark ? THEME_MODES.light : THEME_MODES.dark
          ),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }

  return context;
}
