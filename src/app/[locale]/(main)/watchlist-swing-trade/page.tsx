'use client';

import { useEffect } from 'react';
import { WatchlistSwingTradeTable } from '@/components/tables/watchlist-swing-trade.table';
import { useTranslations } from 'next-intl';

export default function WatchlistSwingTrade() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('watchlistSwingTrade');
  }, [t]);

  return <WatchlistSwingTradeTable />;
}
