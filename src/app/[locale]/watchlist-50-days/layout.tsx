import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import WatchlistIn50Days from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('watchlistIn50Days'),
    description: t('watchlistIn50DaysDesc')
  };
}

export default function Watchlist50DaysLayout() {
  return <WithGuard Page={WatchlistIn50Days} Guard={AuthGuard} />;
}
