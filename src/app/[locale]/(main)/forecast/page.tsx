'use client';

import { useEffect } from 'react';
import { EstForecastSelectedTable } from '@/components/tables/est-forecast-selected.table';
import { useTranslations } from 'next-intl';

export default function EstForecastSelected() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('earningsStrategy');
  }, [t]);

  return <EstForecastSelectedTable />;
}
