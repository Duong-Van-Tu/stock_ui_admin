import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/auth.hook';
import { useAppSelector } from '@/redux/hooks';
import { watchProfileLoading } from '@/redux/slices/auth.slice';
import { useRouter } from 'next/navigation';

type NonLoginGuardProps = {
  children: ReactNode;
};

export function NonLoginGuard({ children }: NonLoginGuardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const loading = useAppSelector(watchProfileLoading);

  useEffect(() => {
    if (isLoggedIn && !loading) {
      router.replace('/login');
    }
  }, [isLoggedIn, loading, router]);

  if (isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
