'use client';

import EditLedgerEntry from '@/components/forms/edit-ledger-entry.form';
import MainLayout from '@/layout/main.layout';

export default function LedgerEntryDetail() {
  return (
    <MainLayout>
      <EditLedgerEntry />
    </MainLayout>
  );
}
