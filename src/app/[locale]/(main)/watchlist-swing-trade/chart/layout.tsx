import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';
import WatchlistChartPage from './page';

export default function WatchlistChartLayout() {
  return <WithGuard Page={WatchlistChartPage} Guard={AuthGuard} />;
}
