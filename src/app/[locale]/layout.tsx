import type { Metadata } from 'next';
import 'antd/dist/reset.css';
import '../../assets/css/globals.scss';

import { cookies } from 'next/headers';
import Providers from '@/providers';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Locale, locales } from '@/constants/locale.constant';
import {
  DEFAULT_THEME_MODE,
  isThemeMode,
  THEME_COOKIE_KEY,
  THEME_STORAGE_KEY,
  ThemeMode
} from '@/constants/theme.constant';

const createThemeInitScript = (initialThemeMode: ThemeMode) => `
  (function() {
    try {
      var storageKey = '${THEME_STORAGE_KEY}';
      var cookieKey = '${THEME_COOKIE_KEY}';
      var storedMode = window.localStorage.getItem(storageKey);
      var cookieMatch = document.cookie.match(
        new RegExp('(?:^|; )' + cookieKey.replace(/([.$?*|{}()\\\\[\\\\]\\\\/+^])/g, '\\\\$1') + '=([^;]*)')
      );
      var cookieMode = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      var resolvedMode =
        storedMode === 'light' || storedMode === 'dark'
          ? storedMode
          : cookieMode === 'light' || cookieMode === 'dark'
            ? cookieMode
            : '${initialThemeMode}';

      document.documentElement.dataset.theme = resolvedMode;
      document.documentElement.style.colorScheme = resolvedMode;
    } catch (error) {
      document.documentElement.dataset.theme = '${initialThemeMode}';
      document.documentElement.style.colorScheme = '${initialThemeMode}';
    }
  })();
`;

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('appTitle'),
    description: t('appDescription')
  };
}

export default function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = useMessages();
  const storedThemeMode = cookies().get(THEME_COOKIE_KEY)?.value;
  const initialThemeMode = isThemeMode(storedThemeMode)
    ? storedThemeMode
    : DEFAULT_THEME_MODE;
  const themeInitScript = createThemeInitScript(initialThemeMode);

  if (!locales.includes(locale as Locale)) return null;

  if (!messages) {
    return null;
  }

  return (
    <html
      lang={locale || 'en'}
      data-theme={initialThemeMode}
      style={{ colorScheme: initialThemeMode }}
      suppressHydrationWarning
    >
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers initialThemeMode={initialThemeMode}>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
