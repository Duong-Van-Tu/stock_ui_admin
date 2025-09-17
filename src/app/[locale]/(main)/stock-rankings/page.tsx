'use client';

import { useEffect } from 'react';
import { StockRankingTable } from '@/components/tables/stock-ranking.table';
import { useTranslations } from 'next-intl';

export default function StockRanking() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('stockRanking');
  }, [t]);

  return <StockRankingTable />;
}
