'use client';

import { useEffect } from 'react';
import { LedgerEntryTable } from '@/components/tables/ledger-entry.table';
import { useTranslations } from 'next-intl';

export default function ListLedgerEntry() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('ledgerEntry');
  }, [t]);

  return <LedgerEntryTable />;
}
