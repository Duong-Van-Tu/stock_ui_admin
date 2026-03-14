export const THEME_MODES = {
  light: 'light',
  dark: 'dark',
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

export const THEME_STORAGE_KEY = 'stock-admin-theme-mode';

export const appThemeTokens: Record<
  ThemeMode,
  {
    colorPrimary: string;
    colorBgBase: string;
    colorBgContainer: string;
    colorText: string;
    colorTextSecondary: string;
    colorBorder: string;
    colorSuccess: string;
    colorWarning: string;
    colorError: string;
    layoutHeaderBg: string;
    layoutBodyBg: string;
  }
> = {
  light: {
    colorPrimary: '#087ff4',
    colorBgBase: '#fff6f6',
    colorBgContainer: '#ffffff',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: '#5d5d5d',
    colorBorder: 'rgba(5, 5, 5, 0.06)',
    colorSuccess: '#10ba08',
    colorWarning: '#ffbf00',
    colorError: '#d32f2f',
    layoutHeaderBg: '#ffffff',
    layoutBodyBg: '#f5f7fa',
  },
  dark: {
    colorPrimary: '#4da3ff',
    colorBgBase: '#0b1220',
    colorBgContainer: '#111827',
    colorText: 'rgba(255, 255, 255, 0.92)',
    colorTextSecondary: '#94a3b8',
    colorBorder: 'rgba(148, 163, 184, 0.22)',
    colorSuccess: '#22c55e',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    layoutHeaderBg: '#111827',
    layoutBodyBg: '#020617',
  },
};
