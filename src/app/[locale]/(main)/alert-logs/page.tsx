'use client';

import { useEffect } from 'react';
import { AlertLogsTable } from '@/components/tables/alert-logs.table';
import { useTranslations } from 'next-intl';

export default function AlertLogs() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('alertLogs');
  }, [t]);

  return <AlertLogsTable />;
}
