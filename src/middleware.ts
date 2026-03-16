import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './lib/i18n';

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale,

  // Always add locale prefix to URL
  localePrefix: 'always',
});

export const config = {
  // Match only internationalized pathnames, excluding API routes and static assets
  matcher: ['/((?!api|_next/static|_next/image|_next/font|favicon.ico).*)'],
};
