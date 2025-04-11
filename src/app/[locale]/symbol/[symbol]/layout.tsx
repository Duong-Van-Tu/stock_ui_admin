import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import StockDetailPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('symbol'),
    description: t('stockDetailDesc')
  };
}

export default function AlertLogsLayout() {
  return <WithGuard Page={StockDetailPage} Guard={AuthGuard} />;
}
