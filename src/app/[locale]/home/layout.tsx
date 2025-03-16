import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { ReactNode } from 'react';
import Home from './page';
import { AuthGuard } from '@/guards/auth.guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('home'),
    description: t('homeDescription')
  };
}

export default function LoginLayout() {
  return <WithGuard Page={Home} Guard={AuthGuard} />;
}
