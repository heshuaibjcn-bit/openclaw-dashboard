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
  // Match only internationalized pathnames
  // Exclude API routes and static files from locale middleware
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_api`, `/_next` or `/_static`
    // - … or the filename
    '/((?!api|_api|_next/static|_next/image|_next/chunks|favicon.ico).*)',
  ],
};
