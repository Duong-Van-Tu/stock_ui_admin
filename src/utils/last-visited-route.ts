type SearchParamsLike =
  | URLSearchParams
  | {
      toString(): string;
    }
  | null
  | undefined;

const LAST_VISITED_ROUTE_STORAGE_KEY = 'last-visited-main-route';
const NON_RESTORABLE_SEGMENTS = new Set(['login', 'register']);
const DEFAULT_ENTRY_SEGMENTS = new Set(['home']);
const EXTERNAL_ROUTE_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

const getRoutePath = (route: string) => route.split('?')[0].split('#')[0];

const getRouteSegments = (route: string) =>
  getRoutePath(route).split('/').filter(Boolean);

export const buildRouteWithSearch = (
  pathname: string,
  searchParams?: SearchParamsLike
) => {
  const query = searchParams?.toString();
  return query ? `${pathname}?${query}` : pathname;
};

export const isInternalRoute = (route?: string | null): route is string => {
  if (!route) return false;

  return (
    route.startsWith('/') &&
    !route.startsWith('//') &&
    !EXTERNAL_ROUTE_PATTERN.test(route)
  );
};

export const isRestorableRoute = (route?: string | null): route is string => {
  if (!isInternalRoute(route)) return false;

  const [, pageSegment = ''] = getRouteSegments(route);
  return Boolean(pageSegment) && !NON_RESTORABLE_SEGMENTS.has(pageSegment);
};

export const isDefaultRestoreEntryRoute = (route?: string | null) => {
  if (!isInternalRoute(route)) return false;

  const [, pageSegment = ''] = getRouteSegments(route);
  return DEFAULT_ENTRY_SEGMENTS.has(pageSegment);
};

export const withLocalePath = (route: string, locale: string) => {
  if (!route.startsWith('/')) {
    return `/${locale}/${route}`;
  }

  const [routePath, queryString = ''] = route.split('?');
  const [firstSegment = ''] = getRouteSegments(routePath);

  if (firstSegment === locale) {
    return route;
  }

  return `/${locale}${routePath}${queryString ? `?${queryString}` : ''}`;
};

export const getStoredLastVisitedRoute = () => {
  if (typeof window === 'undefined') return null;

  try {
    const storedRoute = window.localStorage.getItem(
      LAST_VISITED_ROUTE_STORAGE_KEY
    );

    if (!isRestorableRoute(storedRoute)) {
      if (storedRoute) {
        window.localStorage.removeItem(LAST_VISITED_ROUTE_STORAGE_KEY);
      }
      return null;
    }

    return storedRoute;
  } catch (error) {
    console.warn('[last-visited-route] Failed to read stored route', error);
    return null;
  }
};

export const saveLastVisitedRoute = (route: string) => {
  if (typeof window === 'undefined' || !isRestorableRoute(route)) return;

  try {
    window.localStorage.setItem(LAST_VISITED_ROUTE_STORAGE_KEY, route);
  } catch (error) {
    console.warn('[last-visited-route] Failed to save route', error);
  }
};
