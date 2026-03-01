import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import EarningSelectionPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('earningSelection'),
    description: t('earningSelection')
  };
}

export default function EarningSelectionLayout() {
  return <WithGuard Page={EarningSelectionPage} Guard={AuthGuard} />;
}
