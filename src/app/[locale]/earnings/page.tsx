'use client';

import { EarningsTable } from '@/components/tables/earnings.table';
import MainLayout from '@/layout/main.layout';

export default function Earnings() {
  return (
    <MainLayout>
      <EarningsTable />
    </MainLayout>
  );
}
