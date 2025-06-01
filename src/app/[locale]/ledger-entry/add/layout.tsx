import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import LedgerEntryDetail from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('addLedgerEntry'),
    description: t('addLedgerEntryDesc')
  };
}

export default function LedgerEntryLayout() {
  return <WithGuard Page={LedgerEntryDetail} Guard={AuthGuard} />;
}
