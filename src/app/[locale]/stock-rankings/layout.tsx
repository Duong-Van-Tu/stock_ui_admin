import { Metadata } from 'next';
import StockRanking from './page';
import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('stockRanking'),
    description: t('stockRankingDescription')
  };
}

export default function StockRankingLayout() {
  return <WithGuard Page={StockRanking} Guard={AuthGuard} />;
}
