'use client';

import { useEffect } from 'react';
import { LedgerEntryTable } from '@/components/tables/ledger-entry.table';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function ListLedgerEntry() {
  const t = useTranslations();
  useEffect(() => {
    document.title = t('ledgerEntry');
  }, []);

  return (
    <MainLayout>
      <LedgerEntryTable />
    </MainLayout>
  );
}
