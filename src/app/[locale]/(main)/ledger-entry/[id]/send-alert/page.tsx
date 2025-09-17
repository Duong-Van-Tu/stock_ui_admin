'use client';

import { useEffect } from 'react';
import { MembersLedgerEntry } from '@/components/tables/members-ledger-entry.table';
import { useTranslations } from 'next-intl';

export default function SendAlertLedgerEntry() {
  const t = useTranslations();

  useEffect(() => {
    document.title = t('sendAlertPageTitle');
  }, [t]);

  return <MembersLedgerEntry />;
}
