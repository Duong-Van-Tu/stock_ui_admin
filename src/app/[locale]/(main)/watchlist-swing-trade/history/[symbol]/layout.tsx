import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';
import HistoryWatchlistPage from './page';

export default function HistoryWatchlistLayout() {
  return <WithGuard Page={HistoryWatchlistPage} Guard={AuthGuard} />;
}
