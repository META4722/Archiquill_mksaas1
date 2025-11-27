/**
 * Dynamic imports for code splitting and reducing main thread work
 *
 * Use these to lazy-load heavy components that are not critical for initial render
 */

import dynamic from 'next/dynamic';
import type { ComponentType } from 'react';

/**
 * Lazy load a component with loading state
 */
export const createLazyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => {
  return dynamic(importFn, {
    ssr: true,
  });
};

/**
 * Lazy load a component without SSR (client-side only)
 */
export const createClientOnlyComponent = <P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>
) => {
  return dynamic(importFn, {
    ssr: false,
  });
};

/**
 * Common lazy-loaded components
 * Uncomment and customize as needed for your project
 */

// Example: Charts (Recharts is heavy ~50KB)
// export const LazyChart = createLazyComponent(
//   () => import('@/components/ui/chart').then((mod) => ({ default: mod.Chart }))
// );

// Example: Calendar (date-fns + react-day-picker can be heavy)
// export const LazyCalendar = createLazyComponent(
//   () => import('@/components/ui/calendar')
// );

// Example: Data tables (heavy with sorting/filtering)
// export const LazyDataTable = createLazyComponent(
//   () => import('@/components/ui/data-table')
// );
