'use client';

import { useEffect } from 'react';
import EditLedgerEntry from '@/components/forms/edit-ledger-entry.form';
import { useTranslations } from 'next-intl';

export default function LedgerEntryDetail() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('ledgerEntryDetail');
  }, [t]);

  return <EditLedgerEntry />;
}
