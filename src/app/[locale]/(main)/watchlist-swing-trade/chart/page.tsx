'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { WatchlistSwingTradeChartTable } from '@/components/tables/watchlist-swing-trade-chart.table';
import { useSearchParams } from 'next/navigation';

export default function WatchlistChartPage() {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const symbol = searchParams.get('symbol');

  useEffect(() => {
    if (symbol) {
      document.title = `${t('chart')}: ${symbol}`;
    }
  }, [symbol, t]);

  return <WatchlistSwingTradeChartTable />;
}
