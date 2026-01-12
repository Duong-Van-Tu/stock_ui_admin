import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import MarketPsych from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('news'),
    description: t('newsDescription')
  };
}

export default function MarketPsychLayout() {
  return <WithGuard Page={MarketPsych} Guard={AuthGuard} />;
}
