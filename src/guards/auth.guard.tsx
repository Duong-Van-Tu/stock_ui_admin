'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { watchLoggedIn, watchProfileLoading } from '@/redux/slices/auth.slice';
import { PageURLs } from '@/utils/navigate';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const loading = useAppSelector(watchProfileLoading);
  const isLoggedIn = useAppSelector(watchLoggedIn);

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.replace(PageURLs.ofLogin());
      }
    }
  }, [isLoggedIn, loading, pathname, router]);

  if (!isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
