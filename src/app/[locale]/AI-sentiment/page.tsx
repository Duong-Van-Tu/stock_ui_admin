'use client';

import { ListWatcherTable } from '@/components/tables/list-watcher.table';
import MainLayout from '@/layout/main.layout';

export default function AISentiment() {
  return (
    <MainLayout>
      <ListWatcherTable />
    </MainLayout>
  );
}
