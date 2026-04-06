'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/auth.hook';
import { useAppSelector } from '@/redux/hooks';
import { watchProfileLoading } from '@/redux/slices/auth.slice';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getPathnameSegment } from '@/utils/common';
import { PageURLs } from '@/utils/navigate';
import {
  getStoredLastVisitedRoute,
  isRestorableRoute,
  withLocalePath
} from '@/utils/last-visited-route';

type NonLoginGuardProps = {
  children: ReactNode;
};

export function NonLoginGuard({ children }: NonLoginGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();
  const loading = useAppSelector(watchProfileLoading);
  const searchParams = useSearchParams();
  const locale = getPathnameSegment(pathname, 0) || 'en';

  useEffect(() => {
    if (isLoggedIn && !loading) {
      const redirectPath = searchParams.get('redirect');
      const storedRoute = getStoredLastVisitedRoute();
      const fallbackRoute = withLocalePath(PageURLs.ofIndex(), locale);

      if (isRestorableRoute(redirectPath)) {
        router.push(redirectPath);
      } else if (storedRoute) {
        router.push(storedRoute);
      } else {
        router.push(fallbackRoute);
      }
    }
  }, [isLoggedIn, loading, locale, router, searchParams]);

  if (isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
