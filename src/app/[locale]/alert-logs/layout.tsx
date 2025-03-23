import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import AlertLogs from './page';
import { AuthGuard } from '@/guards/auth.guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('alertLogs'),
    description: t('alertLogsDescription')
  };
}

export default function AlertLogsLayout() {
  return <WithGuard Page={AlertLogs} Guard={AuthGuard} />;
}
