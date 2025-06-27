import type { Metadata } from 'next';
import 'antd/dist/reset.css';
import '../../assets/css/globals.scss';

import Providers from '@/providers';
import { NextIntlClientProvider, useMessages } from 'next-intl';
import { Locale, locales } from '@/constants/locale.constant';
import Head from 'next/head';

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
    <html lang={locale || 'en'}>
      <Head>
        <meta
          name='viewport'
          content='width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0'
        />
      </Head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
