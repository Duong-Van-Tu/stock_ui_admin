import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth.hook';
import { useAppSelector } from '@/redux/hooks';
import { watchProfileLoading } from '@/redux/slices/auth.slice';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const loading = useAppSelector(watchProfileLoading);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.replace('/login');
      } else if (pathname === '/') {
        router.replace('/home');
      }
    }
  }, [isLoggedIn, loading, pathname, router]);

  if (!isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
