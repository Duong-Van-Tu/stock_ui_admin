'use client';

import { useEffect } from 'react';
import { EarningsTable } from '@/components/tables/earnings.table';
import { useTranslations } from 'next-intl';

export default function Earnings() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('earnings');
  }, [t]);

  return <EarningsTable />;
}
