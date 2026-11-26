import createMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALES,
  LOCALE_COOKIE_NAME,
  routing,
} from './i18n/routing';
import type { Session } from './lib/auth-types';
import { getAuthCallbackPath, getBaseUrl } from './lib/urls/urls';
import {
  DEFAULT_LOGIN_REDIRECT,
  Routes,
  protectedRoutes,
  routesNotAllowedByLoggedInUsers,
} from './routes';

const intlMiddleware = createMiddleware(routing);

/**
 * 1. Next.js middleware
 * https://nextjs.org/docs/app/building-your-application/routing/middleware
 *
 * 2. Better Auth middleware
 * https://www.better-auth.com/docs/integrations/next#middleware
 *
 * In Next.js middleware, it's recommended to only check for the existence of a session cookie
 * to handle redirection. To avoid blocking requests by making API or database calls.
 */
export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // Handle internal docs link redirection for internationalization
  // Check if this is a docs page without locale prefix
  if (nextUrl.pathname.startsWith('/docs/') || nextUrl.pathname === '/docs') {
    // Get the user's preferred locale from cookie
    const localeCookie = req.cookies.get(LOCALE_COOKIE_NAME);
    const preferredLocale = localeCookie?.value;

    // If user has a non-default locale preference, redirect to localized version
    if (
      preferredLocale &&
      preferredLocale !== DEFAULT_LOCALE &&
      LOCALES.includes(preferredLocale)
    ) {
      const localizedPath = `/${preferredLocale}${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
      console.log(
        '<< middleware end, redirecting docs link to preferred locale:',
        localizedPath
      );
      return NextResponse.redirect(new URL(localizedPath, nextUrl));
    }
  }

  const pathnameWithoutLocale = getPathnameWithoutLocale(
    nextUrl.pathname,
    LOCALES
  );
  const localePrefix = nextUrl.pathname.split('/')[1];
  const locale = LOCALES.includes(localePrefix) ? localePrefix : DEFAULT_LOCALE;
  const isAuthEntry = routesNotAllowedByLoggedInUsers.some(
    (route) => route === pathnameWithoutLocale
  );
  const isProtectedRoute = protectedRoutes.some(
    (route) => route === pathnameWithoutLocale
  );

  if (!isAuthEntry && !isProtectedRoute) {
    return intlMiddleware(req);
  }

  const cookie = req.headers.get('cookie');
  let session: Session | null = null;
  let sessionCookies: string[] = [];

  if (cookie) {
    try {
      const response = await fetch(
        new URL('/api/auth/get-session', getBaseUrl()),
        {
          cache: 'no-store',
          headers: { cookie },
          redirect: 'error',
        }
      );
      if (response.ok) {
        session = await response.json();
        sessionCookies = response.headers.getSetCookie();
      }
    } catch {
      // Protected routes still require a valid session when the auth API fails.
    }
  }

  let response: NextResponse;
  if (session?.user && isAuthEntry) {
    const destination = getAuthCallbackPath(
      nextUrl.searchParams.get('callbackUrl'),
      DEFAULT_LOGIN_REDIRECT,
      locale
    );
    const destinationUrl = new URL(destination, nextUrl);
    const destinationPath = getPathnameWithoutLocale(
      destinationUrl.pathname,
      LOCALES
    );
    response = NextResponse.redirect(
      routesNotAllowedByLoggedInUsers.some((route) => route === destinationPath)
        ? new URL(
            getAuthCallbackPath(null, DEFAULT_LOGIN_REDIRECT, locale),
            nextUrl
          )
        : destinationUrl
    );
  } else if (!session?.user && isProtectedRoute) {
    const loginUrl = new URL(
      getAuthCallbackPath(null, Routes.Login, locale),
      nextUrl
    );
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname + nextUrl.search);
    response = NextResponse.redirect(loginUrl);
  } else {
    response = intlMiddleware(req);
  }

  for (const value of sessionCookies) {
    response.headers.append('Set-Cookie', value);
  }
  return response;
}

/**
 * Get the pathname of the request (e.g. /zh/dashboard to /dashboard)
 */
function getPathnameWithoutLocale(pathname: string, locales: string[]): string {
  const localePattern = new RegExp(`^/(${locales.join('|')})/`);
  return pathname.replace(localePattern, '/');
}

/**
 * Next.js internationalized routing
 * specify the routes the middleware applies to
 *
 * https://next-intl.dev/docs/routing#base-path
 */
export const config = {
  // The `matcher` is relative to the `basePath`
  matcher: [
    // Match all pathnames except for
    // - if they start with `/api`, `/_next` or `/_vercel`
    // - sitemap.xml and robots.txt (must bypass middleware so Next.js serves them as XML/text)
    // - if they contain a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|sitemap\\.xml|robots\\.txt|.*\\..*).*)',
  ],
};
