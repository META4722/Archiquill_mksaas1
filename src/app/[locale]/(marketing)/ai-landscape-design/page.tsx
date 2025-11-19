import { LandscapePlayground } from '@/ai/landscape/components/LandscapePlayground';
import { getRandomSuggestions } from '@/ai/landscape/lib/suggestions';
import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { TreesIcon } from 'lucide-react';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: Locale }>;
}

/**
 * AI Landscape Design Page
 * Transform landscape sketches into photorealistic renderings
 */
export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AILandscapePage' });

  return constructMetadata({
    title: t('metadata.title'),
    description: t('metadata.description'),
    locale,
  });
}

export default async function AILandscapePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AILandscapePage' });
  const suggestions = getRandomSuggestions(4);

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Page Header */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            {t('description')}
          </p>
        </div>

        {/* Main Playground */}
        <LandscapePlayground initialSuggestions={suggestions} />

        {/* How It Works Section */}
        <div className="mt-12 space-y-6 rounded-lg border bg-muted/50 p-6">
          <h2 className="text-2xl font-semibold">{t('howItWorks.title')}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                1
              </div>
              <h3 className="font-medium">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('howItWorks.step1.description')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                2
              </div>
              <h3 className="font-medium">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('howItWorks.step2.description')}
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                3
              </div>
              <h3 className="font-medium">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {t('howItWorks.step3.description')}
              </p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {t('features.title')}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-card p-4 text-center">
              <h3 className="font-medium">{t('features.feature1.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.feature1.description')}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <h3 className="font-medium">{t('features.feature2.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.feature2.description')}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <h3 className="font-medium">{t('features.feature3.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.feature3.description')}
              </p>
            </div>
            <div className="rounded-lg border bg-card p-4 text-center">
              <h3 className="font-medium">{t('features.feature4.title')}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {t('features.feature4.description')}
              </p>
            </div>
          </div>
        </div>

        {/* AI Workflow Enhancement Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-semibold text-center">
            {t('workflow.title')}
          </h2>
          <p className="text-center text-muted-foreground">
            {t('workflow.description')}
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10">
                  <TreesIcon className="size-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t(`workflow.items.${i}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t(`workflow.items.${i}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
