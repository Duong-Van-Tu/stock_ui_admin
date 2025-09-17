import { WithGuard } from '@/guards';
import { NonLoginGuard } from '@/guards/non-login.guard';
import { Metadata } from 'next';
import Register from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('register'),
    description: t('registerDescription')
  };
}

export default function RegisterLayout() {
  return <WithGuard Page={Register} Guard={NonLoginGuard} />;
}
