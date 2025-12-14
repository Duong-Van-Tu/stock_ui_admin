import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import FinnhubLsegNewsPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('finnhubLsegNews'),
    description: t('finnhubLsegNewsPage')
  };
}

export default function FinnhubLsegNewsLayout() {
  return <WithGuard Page={FinnhubLsegNewsPage} Guard={AuthGuard} />;
}
