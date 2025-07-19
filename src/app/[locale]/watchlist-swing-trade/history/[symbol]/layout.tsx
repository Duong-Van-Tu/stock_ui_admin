import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import HistoryWatchlistPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('historyWatchlist'),
    description: t('historyWatchlistPage')
  };
}

export default function HistoryWatchlistLayout() {
  return <WithGuard Page={HistoryWatchlistPage} Guard={AuthGuard} />;
}
