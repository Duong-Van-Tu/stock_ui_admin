'use client';

import { useEffect } from 'react';
import { ListWatcherTable } from '@/components/tables/list-watcher.table';
import { useTranslations } from 'next-intl';

export default function AISentiment() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('AISentiment');
  }, [t]);

  return <ListWatcherTable />;
}
