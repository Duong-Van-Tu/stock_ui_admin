'use client';

import { useEffect } from 'react';
import { AlertLogsTable } from '@/components/tables/alert-logs.table';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function AlertLogs() {
  const t = useTranslations();
  useEffect(() => {
    document.title = t('alertLogs');
  }, []);

  return (
    <MainLayout>
      <AlertLogsTable />
    </MainLayout>
  );
}
