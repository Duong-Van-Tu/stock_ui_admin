'use client';

import { useEffect } from 'react';
import { MembersLedgerEntry } from '@/components/tables/members-ledger-entry.table';
import MainLayout from '@/layout/main.layout';
import { useTranslations } from 'next-intl';

export default function SendAlertLedgerEntry() {
  const t = useTranslations();
  useEffect(() => {
    document.title = t('sendAlertPageTitle');
  }, []);

  return (
    <MainLayout>
      <MembersLedgerEntry />
    </MainLayout>
  );
}
