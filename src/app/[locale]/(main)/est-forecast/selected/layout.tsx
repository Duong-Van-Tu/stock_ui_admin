import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';
import EstForecastSelected from './page';

export default function EstForecastSelectedLayout() {
  return <WithGuard Page={EstForecastSelected} Guard={AuthGuard} />;
}
