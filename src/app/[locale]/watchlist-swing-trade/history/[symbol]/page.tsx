'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import MainLayout from '@/layout/main.layout';
import { HistoryWatchlistSwingTradeTable } from '@/components/tables/history-watchlist-swing-trade.table';

export default function HistoryWatchlistPage() {
  const params = useParams();
  const symbol = params?.symbol as string;

  useEffect(() => {
    if (symbol) {
      document.title = `history: ${symbol}`;
    }
  }, [symbol]);

  return (
    <MainLayout>
      <HistoryWatchlistSwingTradeTable symbol={symbol} />
    </MainLayout>
  );
}
