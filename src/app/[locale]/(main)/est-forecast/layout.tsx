import { WithGuard } from '@/guards';
import { AuthGuard } from '@/guards/auth.guard';

export default function EstForecastLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return <WithGuard Page={() => <>{children}</>} Guard={AuthGuard} />;
}
