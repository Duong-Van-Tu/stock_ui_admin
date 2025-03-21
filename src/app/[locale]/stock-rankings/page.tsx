'use client';
import { StockRankingTable } from '@/components/tables/stock-ranking.table';
import MainLayout from '@/layout/main.layout';

export default function StockRanking() {
  return (
    <MainLayout>
      <StockRankingTable />
    </MainLayout>
  );
}
