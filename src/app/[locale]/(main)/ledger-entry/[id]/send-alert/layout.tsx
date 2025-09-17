import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import SendAlertLedgerEntry from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('sendAlertPageTitle'),
    description: t('sendAlertPageDescription')
  };
}

export default function SendAlertLedgerEntryLayout() {
  return <WithGuard Page={SendAlertLedgerEntry} Guard={AuthGuard} />;
}
