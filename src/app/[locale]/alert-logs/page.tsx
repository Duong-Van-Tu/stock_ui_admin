'use client';
import { AlertLogsTable } from '@/components/tables/alert-logs.table';
import MainLayout from '@/layout/main.layout';

export default function AlertLogs() {
  return (
    <MainLayout>
      <AlertLogsTable />
    </MainLayout>
  );
}
