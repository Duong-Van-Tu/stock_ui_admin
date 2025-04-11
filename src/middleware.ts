import createMiddleware from 'next-intl/middleware';
import { Locale, locales } from './constants/locale.constant';

export default createMiddleware({
  locales,
  defaultLocale: 'en' as Locale
});

export const config = {
  matcher: ['/((?!_next).*)']
};
