'use client';

import { useEffect, useState } from 'react';
import { AlertLogsTable } from '@/components/tables/alert-logs.table';
import { useTranslations } from 'next-intl';

export default function AlertLogs() {
  const t = useTranslations();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    document.title = t('alertLogs');

    const timer = setTimeout(() => {
      setIsReady(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [t]);

  return isReady ? <AlertLogsTable /> : null;
}
