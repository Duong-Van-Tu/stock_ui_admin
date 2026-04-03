import type { Metadata } from 'next';
import 'antd/dist/reset.css';
import '../../assets/css/globals.scss';

import Providers from '@/providers';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Locale, locales } from '@/constants/locale.constant';

const themeInitScript = `
  (function() {
    try {
      var storageKey = 'stock-ui-theme-mode';
      var storedMode = window.localStorage.getItem(storageKey);
      var resolvedMode =
        storedMode === 'light' || storedMode === 'dark'
          ? storedMode
          : 'dark';

      document.documentElement.dataset.theme = resolvedMode;
      document.documentElement.style.colorScheme = resolvedMode;
    } catch (error) {
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
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

  if (!locales.includes(locale as Locale)) return null;

  if (!messages) {
    return null;
  }

  return (
    <html lang={locale || 'en'} suppressHydrationWarning>
      <head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
