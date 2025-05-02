'use client';

import { LedgerEntryTable } from '@/components/tables/ledger-entry.table';
import MainLayout from '@/layout/main.layout';

export default function ListLedgerEntry() {
  return (
    <MainLayout>
      <LedgerEntryTable />
    </MainLayout>
  );
}
