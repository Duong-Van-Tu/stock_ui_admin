'use client';

import StockDetail from '@/components/stock-details';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function StockDetailPage() {
  const params = useParams();
  const symbol = params?.symbol;

  useEffect(() => {
    if (symbol) {
      document.title = `Symbol: ${symbol}`;
    }
  }, [symbol]);
  return <StockDetail />;
}
