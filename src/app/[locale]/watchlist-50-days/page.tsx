'use client';

import { WatchlistIn50DaysTable } from '@/components/tables/watchlist-50Days.table';
import MainLayout from '@/layout/main.layout';

export default function WatchlistIn50Days() {
  return (
    <MainLayout>
      <WatchlistIn50DaysTable />
    </MainLayout>
  );
}
