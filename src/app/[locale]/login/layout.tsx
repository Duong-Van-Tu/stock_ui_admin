import { Metadata } from 'next';
import { ReactNode } from 'react';

interface AlertLayoutProps {
  children: ReactNode;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('login'),
    description: t('loginDescription')
  };
}

export default function LoginLayout({ children }: AlertLayoutProps) {
  return children;
}
