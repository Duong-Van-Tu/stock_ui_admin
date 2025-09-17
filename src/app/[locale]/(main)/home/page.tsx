'use client';

import { useEffect } from 'react';
import TradeSignalsDashboard from '@/components/trade-signals-dashboard';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('tradeSignalsDashboard');
  }, [t]);

  return <TradeSignalsDashboard />;
}
