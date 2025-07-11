'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/auth.hook';
import { useAppSelector } from '@/redux/hooks';
import { watchProfileLoading } from '@/redux/slices/auth.slice';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageURLs } from '@/utils/navigate';

type NonLoginGuardProps = {
  children: ReactNode;
};

export function NonLoginGuard({ children }: NonLoginGuardProps) {
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const loading = useAppSelector(watchProfileLoading);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoggedIn && !loading) {
      const redirectPath = searchParams.get('redirect');
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(PageURLs.ofIndex());
      }
    }
  }, [isLoggedIn, loading, router, searchParams]);

  if (isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
