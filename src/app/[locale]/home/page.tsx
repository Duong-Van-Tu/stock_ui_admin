'use client';

import TradeSignalsDashboard from '@/components/trade-signals-dashboard';
import MainLayout from '@/layout/main.layout';

export default function Home() {
  return (
    <MainLayout>
      <TradeSignalsDashboard />
    </MainLayout>
  );
}
