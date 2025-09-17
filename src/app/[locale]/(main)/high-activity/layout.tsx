import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import HighActivity from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('listHighActivity'),
    description: t('listHighActivityDesc')
  };
}

export default function HighActivityLayout() {
  return <WithGuard Page={HighActivity} Guard={AuthGuard} />;
}
