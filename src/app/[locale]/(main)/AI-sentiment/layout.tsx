import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import AISentiment from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('AISentiment'),
    description: t('AISentimentDescription')
  };
}

export default function NewsLayout() {
  return <WithGuard Page={AISentiment} Guard={AuthGuard} />;
}
