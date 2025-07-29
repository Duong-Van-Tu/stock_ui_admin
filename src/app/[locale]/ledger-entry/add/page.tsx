'use client';

import { useEffect } from 'react';
import FormAddLedgerEntry from '@/components/forms/add-ledger-entry.form';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function AddLedgerEntry() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('addLedgerEntry');
  }, [t]);

  return (
    <MainLayout>
      <FormAddLedgerEntry />
    </MainLayout>
  );
}
