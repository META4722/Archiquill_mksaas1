import { BackgroundRemovalPlayground } from '@/ai/background-removal/components/BackgroundRemovalPlayground';
import Container from '@/components/layout/container';
import { constructMetadata } from '@/lib/metadata';
import { ScissorsIcon } from 'lucide-react';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{ locale: Locale }>;
}

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AIBackgroundRemovalPage' });

  return constructMetadata({
    title: t('metadata.title'),
    description: t('metadata.description'),
    locale,
  });
}

export default async function AIBackgroundRemovalPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AIBackgroundRemovalPage' });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-12 sm:py-16">
        <Container>
          <div className="text-center">
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {t('hero.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* Playground */}
      <section className="py-12 sm:py-16">
        <Container>
          <BackgroundRemovalPlayground />
        </Container>
      </section>

      {/* How It Works */}
      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              {t('howItWorks.title')}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {(['1', '2', '3'] as const).map((step) => (
                <div key={step} className="text-center">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {step}
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">
                    {t(`howItWorks.steps.${step}.title` as any)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t(`howItWorks.steps.${step}.description` as any)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Use Cases */}
      <section className="border-t py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">
              {t('useCases.title')}
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
              {t('useCases.description')}
            </p>
            <div className="grid gap-6 md:grid-cols-2">
              {(['ecommerce', 'portrait', 'design', 'presentation'] as const).map((key) => (
                <div key={key} className="flex gap-4 rounded-lg border bg-card p-6">
                  <ScissorsIcon className="size-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="mb-2 font-semibold">
                      {t(`useCases.items.${key}.title` as any)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t(`useCases.items.${key}.description` as any)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
