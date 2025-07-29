'use client';

import { useEffect } from 'react';
import { ListHighActivity } from '@/components/tables/list-high-activity.table';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function HighActivity() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('listHighActivity');
  }, [t]);

  return (
    <MainLayout>
      <ListHighActivity />
    </MainLayout>
  );
}
