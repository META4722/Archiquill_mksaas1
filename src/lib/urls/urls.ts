import { LOCALES, routing } from '@/i18n/routing';
import type { Locale } from 'next-intl';

const serverBaseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ??
  `http://localhost:${process.env.PORT ?? 3000}`;

/**
 * Get the base URL of the application
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return serverBaseUrl;
}

/**
 * Check if the locale should be appended to the URL
 */
export function shouldAppendLocale(locale?: Locale | null): boolean {
  return !!locale && locale !== routing.defaultLocale && locale !== 'default';
}

/**
 * Get the URL of the application with the locale appended
 */
export function getUrlWithLocale(url: string, locale?: Locale | null): string {
  const baseUrl = getBaseUrl();

  return shouldAppendLocale(locale)
    ? `${baseUrl}/${locale}${url}`
    : `${baseUrl}${url}`;
}

export function getAuthCallbackPath(
  callback: string | null | undefined,
  fallback: string,
  locale: Locale
): string {
  const origin = new URL(getBaseUrl()).origin;
  let target = new URL(fallback, origin);

  if (callback) {
    try {
      const candidate = new URL(callback, origin);
      if (
        candidate.origin === origin &&
        !candidate.username &&
        !candidate.password &&
        !candidate.pathname.startsWith('//')
      ) {
        target = candidate;
      }
    } catch {
      // Use the default destination for malformed callback URLs.
    }
  }

  const hasLocale = LOCALES.includes(target.pathname.split('/')[1]);
  const prefix = shouldAppendLocale(locale) && !hasLocale ? `/${locale}` : '';
  return `${prefix}${target.pathname}${target.search}${target.hash}`;
}

export function getUrlWithLocaleInCallbackUrl(
  url: string,
  locale: Locale
): string {
  const verificationUrl = new URL(url);
  const callback = verificationUrl.searchParams.get('callbackURL');
  if (callback) {
    verificationUrl.searchParams.set(
      'callbackURL',
      getAuthCallbackPath(callback, '/', locale)
    );
  }
  return verificationUrl.toString();
}

/**
 * Get the URL of the image, if the image is a relative path, it will be prefixed with the base URL
 * @param image - The image URL
 * @returns The URL of the image
 */
export function getImageUrl(image: string): string {
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image;
  }
  if (image.startsWith('/')) {
    return `${getBaseUrl()}${image}`;
  }
  return `${getBaseUrl()}/${image}`;
}

/**
 * Get the Stripe dashboard customer URL
 * @param customerId - The Stripe customer ID
 * @returns The Stripe dashboard customer URL
 */
export function getStripeDashboardCustomerUrl(customerId: string): string {
  if (process.env.NODE_ENV === 'development') {
    return `https://dashboard.stripe.com/test/customers/${customerId}`;
  }
  return `https://dashboard.stripe.com/customers/${customerId}`;
}
