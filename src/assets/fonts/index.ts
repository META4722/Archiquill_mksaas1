import localFont from 'next/font/local';

// Bundle the fonts so production builds do not depend on Google Fonts.
export const fontNotoSans = localFont({
  src: './notosans.woff2',
  display: 'swap',
  variable: '--font-noto-sans',
  weight: '500 700',
});

export const fontNotoSerif = localFont({
  src: './notoserif.woff2',
  preload: false,
  display: 'swap',
  variable: '--font-noto-serif',
  weight: '400',
  adjustFontFallback: 'Times New Roman',
});

export const fontNotoSansMono = localFont({
  src: './notosansmono.woff2',
  preload: false,
  display: 'swap',
  variable: '--font-noto-sans-mono',
  weight: '400',
  adjustFontFallback: false,
  fallback: ['monospace'],
});

export const fontBricolageGrotesque = localFont({
  src: './bricolagegrotesque.woff2',
  preload: false,
  display: 'swap',
  variable: '--font-bricolage-grotesque',
  weight: '400 700',
});
