export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'stock-ui-theme-mode';
export const THEME_COOKIE_KEY = 'stock-ui-theme-mode';
export const DEFAULT_THEME_MODE: ThemeMode = 'dark';

export function isThemeMode(value: string | null | undefined): value is ThemeMode {
  return value === 'light' || value === 'dark';
}
