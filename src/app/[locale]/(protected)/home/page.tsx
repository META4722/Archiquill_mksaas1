import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `Home - ${t('name')}`,
    description: t('description'),
    locale,
    pathname: '/home',
  });
}

export default async function HomePage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">Home</h1>
        <p className="mt-4 text-muted-foreground">
          Welcome to ArchiQuill
        </p>
      </div>
    </div>
  );
}
