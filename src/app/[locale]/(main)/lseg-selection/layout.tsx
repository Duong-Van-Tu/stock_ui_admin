import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import LsegSelectionPage from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('lsegSelection'),
    description: t('lsegSelectionDescription')
  };
}

export default function LsegSelectionLayout() {
  return <WithGuard Page={LsegSelectionPage} Guard={AuthGuard} />;
}
