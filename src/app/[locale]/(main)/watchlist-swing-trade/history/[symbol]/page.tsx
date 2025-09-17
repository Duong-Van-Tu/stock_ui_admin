'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { HistoryWatchlistSwingTradeTable } from '@/components/tables/history-watchlist-swing-trade.table';
import { useTranslations } from 'next-intl';

export default function HistoryWatchlistPage() {
  const t = useTranslations();
  const params = useParams();
  const symbol = params?.symbol as string;

  useEffect(() => {
    if (symbol) {
      document.title = `${t('history')}: ${symbol}`;
    }
  }, [symbol, t]);

  return <HistoryWatchlistSwingTradeTable symbol={symbol} />;
}
