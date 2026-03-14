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
  'shell-gradient-start': string;
  'shell-gradient-end': string;
  'shell-accent-glow': string;
  'sidebar-bg': string;
  'sidebar-border': string;
  'sidebar-shadow': string;
  'topbar-bg': string;
  'topbar-border': string;
  'content-frame-bg': string;
  'content-frame-border': string;
  'content-frame-shadow': string;
  'icon-accent-color': string;
  'icon-accent-bg-start': string;
  'icon-accent-bg-end': string;
  'icon-accent-border': string;
  'icon-accent-shadow': string;
  'menu-item-color': string;
  'menu-item-selected-bg': string;
  'menu-item-selected-color': string;
  'market-badge-bg': string;
  'market-badge-border': string;
  'market-badge-text': string;
  'market-pill-start': string;
  'market-pill-end': string;
  'ticker-bg': string;
  'ticker-border': string;
  'ticker-text': string;
  'user-chip-border': string;
  'drawer-divider': string;
  'drawer-subtitle': string;
  'close-button-color': string;
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
      'shell-gradient-start': '#ffffff',
      'shell-gradient-end': '#f7fbff',
      'shell-accent-glow': 'rgba(8, 127, 244, 0.08)',
      'sidebar-bg': 'rgba(255, 255, 255, 0.92)',
      'sidebar-border': 'rgba(15, 23, 42, 0.08)',
      'sidebar-shadow': '0 2.4rem 6rem rgba(15, 23, 42, 0.06)',
      'topbar-bg': 'rgba(255, 255, 255, 0.84)',
      'topbar-border': 'rgba(15, 23, 42, 0.06)',
      'content-frame-bg': 'rgba(255, 255, 255, 0.72)',
      'content-frame-border': 'rgba(15, 23, 42, 0.06)',
      'content-frame-shadow': '0 2.4rem 6rem rgba(15, 23, 42, 0.06)',
      'icon-accent-color': '#1677ff',
      'icon-accent-bg-start': '#f7fbff',
      'icon-accent-bg-end': '#eef6ff',
      'icon-accent-border': 'rgba(22, 119, 255, 0.18)',
      'icon-accent-shadow': '0 1rem 2.4rem rgba(22, 119, 255, 0.14)',
      'menu-item-color': 'rgba(15, 23, 42, 0.88)',
      'menu-item-selected-bg': '#dff0ff',
      'menu-item-selected-color': '#1677ff',
      'market-badge-bg': 'rgba(255, 77, 79, 0.05)',
      'market-badge-border': 'rgba(245, 34, 45, 0.12)',
      'market-badge-text': '#ef4444',
      'market-pill-start': '#ffbf43',
      'market-pill-end': '#ff9f1c',
      'ticker-bg': '#ffffff',
      'ticker-border': 'rgba(22, 119, 255, 0.24)',
      'ticker-text': '#1677ff',
      'user-chip-border': 'rgba(15, 23, 42, 0.1)',
      'drawer-divider': 'rgba(15, 23, 42, 0.08)',
      'drawer-subtitle': 'rgba(15, 23, 42, 0.55)',
      'close-button-color': 'rgba(15, 23, 42, 0.62)',
    },
  },
  dark: {
    colorPrimary: '#5ab2ff',
    colorBgBase: '#06111f',
    colorBgContainer: '#0f1b2d',
    colorText: 'rgba(255, 255, 255, 0.92)',
    colorTextSecondary: '#9eb2cc',
    colorBorder: 'rgba(125, 164, 212, 0.22)',
    colorSuccess: '#22c55e',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    layoutHeaderBg: '#0d1828',
    layoutBodyBg: '#040b16',
    cssVariables: {
      'text-color': 'rgba(255, 255, 255, 0.92)',
      'surface-base-color': '#040b16',
      'header-background-color': '#0d1828',
      'text-on-dark-color': '#ffffff',
      'text-on-dark-muted-color': '#93a9c7',
      'login-gradient-start-color': '#08111f',
      'login-gradient-end-color': '#10203a',
      'shell-gradient-start': '#08111f',
      'shell-gradient-end': '#030712',
      'shell-accent-glow': 'rgba(56, 189, 248, 0.14)',
      'sidebar-bg': 'rgba(9, 18, 32, 0.92)',
      'sidebar-border': 'rgba(110, 145, 186, 0.14)',
      'sidebar-shadow': '0 2.4rem 6rem rgba(0, 0, 0, 0.42)',
      'topbar-bg': 'rgba(8, 17, 31, 0.82)',
      'topbar-border': 'rgba(110, 145, 186, 0.14)',
      'content-frame-bg':
        'linear-gradient(180deg, rgba(10, 20, 36, 0.9) 0%, rgba(7, 15, 28, 0.82) 100%)',
      'content-frame-border': 'rgba(110, 145, 186, 0.14)',
      'content-frame-shadow': '0 3rem 8rem rgba(0, 0, 0, 0.38)',
      'icon-accent-color': '#78c4ff',
      'icon-accent-bg-start': '#10233d',
      'icon-accent-bg-end': '#0b1728',
      'icon-accent-border': 'rgba(120, 196, 255, 0.22)',
      'icon-accent-shadow': '0 1.2rem 2.8rem rgba(56, 189, 248, 0.18)',
      'menu-item-color': 'rgba(232, 241, 255, 0.82)',
      'menu-item-selected-bg': 'rgba(44, 130, 255, 0.18)',
      'menu-item-selected-color': '#8ecaff',
      'market-badge-bg': 'rgba(127, 29, 29, 0.22)',
      'market-badge-border': 'rgba(248, 113, 113, 0.16)',
      'market-badge-text': '#fda4af',
      'market-pill-start': '#f59e0b',
      'market-pill-end': '#ea580c',
      'ticker-bg': 'rgba(8, 17, 31, 0.92)',
      'ticker-border': 'rgba(120, 196, 255, 0.22)',
      'ticker-text': '#8ecaff',
      'user-chip-border': 'rgba(110, 145, 186, 0.16)',
      'drawer-divider': 'rgba(110, 145, 186, 0.16)',
      'drawer-subtitle': 'rgba(198, 214, 235, 0.62)',
      'close-button-color': 'rgba(219, 234, 254, 0.72)',
    },
  },
};
