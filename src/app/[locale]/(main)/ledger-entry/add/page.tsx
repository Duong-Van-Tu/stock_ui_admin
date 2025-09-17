'use client';

import { useEffect } from 'react';
import FormAddLedgerEntry from '@/components/forms/add-ledger-entry.form';
import { useTranslations } from 'next-intl';

export default function AddLedgerEntry() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('addLedgerEntry');
  }, [t]);

  return <FormAddLedgerEntry />;
}
