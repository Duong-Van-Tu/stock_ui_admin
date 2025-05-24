import { WithGuard } from '@/guards';
import { Metadata } from 'next';
import { AuthGuard } from '@/guards/auth.guard';
import SpikeVolume from './page';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Spike Volume',
    description: 'Backtest Spike Volume Strategy Page'
  };
}

export default function SpikeVolumeLayout() {
  return <WithGuard Page={SpikeVolume} Guard={AuthGuard} />;
}
