import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import Earnings from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('earnings'),
    description: t('earningsDescription')
  };
}

export default function EarningsLayout() {
  return <WithGuard Page={Earnings} Guard={AuthGuard} />;
}
