import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('earningsStrategy'),
    description: t('earningsStrategy')
  };
}

export default function EstForecastLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <WithGuard Page={() => <>{children}</>} Guard={AuthGuard} />;
}
