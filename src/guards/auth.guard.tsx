'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { watchLoggedIn, watchProfileLoading } from '@/redux/slices/auth.slice';
import { PageURLs } from '@/utils/navigate';
import { getPathnameSegment } from '@/utils/common';
import {
  buildRouteWithSearch,
  isRestorableRoute,
  withLocalePath
} from '@/utils/last-visited-route';

type AuthGuardProps = {
  children: ReactNode;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loading = useAppSelector(watchProfileLoading);
  const isLoggedIn = useAppSelector(watchLoggedIn);
  const locale = getPathnameSegment(pathname, 0) || 'en';

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        const currentRoute = buildRouteWithSearch(pathname, searchParams);
        const loginPath = withLocalePath(PageURLs.ofLogin(), locale);
        const redirectQuery = isRestorableRoute(currentRoute)
          ? `?redirect=${encodeURIComponent(currentRoute)}`
          : '';

        router.replace(`${loginPath}${redirectQuery}`);
      }
    }
  }, [isLoggedIn, loading, locale, pathname, router, searchParams]);

  if (!isLoggedIn && !loading) {
    return null;
  }

  return <>{children}</>;
}
