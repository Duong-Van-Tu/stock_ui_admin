'use client';
import { SpikeVolumeTable } from '@/components/tables/spike-volume.table';
import MainLayout from '@/layout/main.layout';

export default function SpikeVolume() {
  return (
    <MainLayout>
      <SpikeVolumeTable />
    </MainLayout>
  );
}
