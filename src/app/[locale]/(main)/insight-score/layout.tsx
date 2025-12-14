import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import NewsScores from './page';

export async function generateMetadata(): Promise<Metadata> {
  const t = await import('next-intl/server').then((m) => m.getTranslations());

  return {
    title: t('newsScores'),
    description: t('newsScoresDescription')
  };
}

export default function NewsScoresLayout() {
  return <WithGuard Page={NewsScores} Guard={AuthGuard} />;
}
