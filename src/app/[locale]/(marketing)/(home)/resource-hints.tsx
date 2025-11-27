/**
 * Resource hints to optimize LCP and critical resource loading
 * This component should be placed in the head to preconnect to external domains
 */
export function ResourceHints() {
  return (
    <>
      {/* Preconnect to external domains for faster resource loading */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossOrigin="anonymous"
      />
      <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />

      {/* Preconnect to image CDNs */}
      <link rel="preconnect" href="https://img.archiquill.com" />
      <link rel="preconnect" href="https://ik.imagekit.io" />
      <link rel="preconnect" href="https://res.cloudinary.com" />
    </>
  );
}
