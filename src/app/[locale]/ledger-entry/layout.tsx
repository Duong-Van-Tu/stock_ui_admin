import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import ListLedgerEntry from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('LedgerEntry'),
    description: t('LedgerEntryDesc')
  };
}

export default function LedgerEntryLayout() {
  return <WithGuard Page={ListLedgerEntry} Guard={AuthGuard} />;
}
