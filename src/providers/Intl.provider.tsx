'use client';

import { NextIntlClientProvider, useMessages } from 'next-intl';

export default function IntlProvider({
  locale,
  children
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const messages = useMessages();
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
