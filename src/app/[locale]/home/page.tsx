'use client';

import { useEffect } from 'react';
import TradeSignalsDashboard from '@/components/trade-signals-dashboard';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations();
  useEffect(() => {
    document.title = t('tradeSignalsDashboard');
  }, []);

  return (
    <MainLayout>
      <TradeSignalsDashboard />
    </MainLayout>
  );
}
