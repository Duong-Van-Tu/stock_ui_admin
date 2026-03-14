export const THEME_MODES = {
  light: 'light',
  dark: 'dark',
} as const;

export type ThemeMode = (typeof THEME_MODES)[keyof typeof THEME_MODES];

export const THEME_STORAGE_KEY = 'stock-admin-theme-mode';

type ThemeCssVariables = {
  'text-color': string;
  'surface-base-color': string;
  'header-background-color': string;
  'text-on-dark-color': string;
  'text-on-dark-muted-color': string;
  'login-gradient-start-color': string;
  'login-gradient-end-color': string;
};

type AppThemeTokens = {
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
  cssVariables: ThemeCssVariables;
};

export const appThemeTokens: Record<ThemeMode, AppThemeTokens> = {
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
    cssVariables: {
      'text-color': 'rgba(0, 0, 0, 0.88)',
      'surface-base-color': '#f5f7fa',
      'header-background-color': '#0f172a',
      'text-on-dark-color': '#ffffff',
      'text-on-dark-muted-color': '#cbd5e1',
      'login-gradient-start-color': '#f8fafc',
      'login-gradient-end-color': '#e2e8f0',
    },
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
    cssVariables: {
      'text-color': 'rgba(255, 255, 255, 0.92)',
      'surface-base-color': '#020617',
      'header-background-color': '#111827',
      'text-on-dark-color': '#ffffff',
      'text-on-dark-muted-color': '#94a3b8',
      'login-gradient-start-color': '#0f172a',
      'login-gradient-end-color': '#111827',
    },
  },
};
