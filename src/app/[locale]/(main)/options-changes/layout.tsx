import { Metadata } from 'next';
import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';
import OptionsChanges from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('optionsChanges'),
    description: t('optionsChanges')
  };
}

export default function OptionsChangesLayout() {
  return <WithGuard Page={OptionsChanges} Guard={AuthGuard} />;
}
