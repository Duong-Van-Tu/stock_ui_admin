import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import BreakingNewsAnalyticsPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('breakingNewsAnalytics'),
    description: t('breakingNewsAnalyticsDescription')
  };
}

export default function BreakingNewsAnalyticsLayout() {
  return <WithGuard Page={BreakingNewsAnalyticsPage} Guard={AuthGuard} />;
}
