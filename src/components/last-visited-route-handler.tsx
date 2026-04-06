'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAppSelector } from '@/redux/hooks';
import { watchLoggedIn, watchProfileLoading } from '@/redux/slices/auth.slice';
import {
  buildRouteWithSearch,
  getStoredLastVisitedRoute,
  isDefaultRestoreEntryRoute,
  isRestorableRoute,
  saveLastVisitedRoute
} from '@/utils/last-visited-route';

export default function LastVisitedRouteHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isLoggedIn = useAppSelector(watchLoggedIn);
  const loading = useAppSelector(watchProfileLoading);
  const hasHandledInitialRoute = useRef(false);

  useEffect(() => {
    if (loading || !pathname) return;

    if (!isLoggedIn) {
      hasHandledInitialRoute.current = false;
      return;
    }

    const currentRoute = buildRouteWithSearch(pathname, searchParams);
    const searchParamsString = searchParams.toString();

    if (!hasHandledInitialRoute.current) {
      hasHandledInitialRoute.current = true;

      const storedRoute = getStoredLastVisitedRoute();
      const shouldRestore =
        Boolean(storedRoute) &&
        storedRoute !== currentRoute &&
        isDefaultRestoreEntryRoute(currentRoute) &&
        !searchParamsString;

      if (shouldRestore && storedRoute) {
        router.replace(storedRoute);
        return;
      }
    }

    if (isRestorableRoute(currentRoute)) {
      saveLastVisitedRoute(currentRoute);
    }
  }, [isLoggedIn, loading, pathname, router, searchParams]);

  return null;
}
