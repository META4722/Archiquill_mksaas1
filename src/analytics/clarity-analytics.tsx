'use client';

import Script from 'next/script';

/**
 * Clarity Analytics
 *
 * https://clarity.microsoft.com
 * https://mksaas.com/docs/analytics#clarity
 */
export default function ClarityAnalytics() {
  if (process.env.NODE_ENV !== 'production') {
    return null;
  }

  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  if (!projectId) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity-init"
      strategy="lazyOnload"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{
        __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${projectId}");
                `,
      }}
    />
  );
}
