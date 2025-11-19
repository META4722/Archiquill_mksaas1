import { GardenPlayground } from '@/ai/garden';
import Container from '@/components/layout/container';
import { CheckCircle2, ImageIcon, SparklesIcon, TreesIcon, ZapIcon } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'AIGardenPage.metadata',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function GardenPage({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'AIGardenPage' });

  return (
    <div className="flex flex-col">
      {/* Hero Section - Compact */}
      <section className="border-b bg-gradient-to-b from-background to-muted/20 py-8">
        <Container>
          <div className="text-center">
            <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
              {t('hero.title')}
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              {t('hero.description')}
            </p>
          </div>
        </Container>
      </section>

      {/* Playground Section */}
      <section className="py-12">
        <Container>
          <GardenPlayground />
        </Container>
      </section>

      {/* How It Works Section */}
      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              {t('howItWorks.title')}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  1
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t('howItWorks.steps.1.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('howItWorks.steps.1.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  2
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t('howItWorks.steps.2.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('howItWorks.steps.2.description')}
                </p>
              </div>
              <div className="text-center">
                <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  3
                </div>
                <h3 className="mb-2 text-lg font-semibold">
                  {t('howItWorks.steps.3.title')}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {t('howItWorks.steps.3.description')}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Features Section */}
      <section className="border-t py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-12 text-center text-3xl font-bold">
              {t('features.title')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-4 rounded-lg border bg-card p-6">
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    {t('features.items.0.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.items.0.description')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border bg-card p-6">
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    {t('features.items.1.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.items.1.description')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border bg-card p-6">
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    {t('features.items.2.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.items.2.description')}
                  </p>
                </div>
              </div>
              <div className="flex gap-4 rounded-lg border bg-card p-6">
                <CheckCircle2 className="size-6 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-2 font-semibold">
                    {t('features.items.3.title')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('features.items.3.description')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Popular Garden Types Section */}
      <section className="border-t bg-muted/30 py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">
              {t('gardenTypes.title')}
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
              {t('gardenTypes.description')}
            </p>
            <div className="space-y-8">
              {['small', 'shade', 'cottage', 'rock', 'zen'].map((type) => (
                <div key={type} className="rounded-lg border bg-card p-6">
                  <h3 className="mb-3 text-xl font-semibold">
                    {t(`gardenTypes.types.${type}.title`)}
                  </h3>
                  <p className="text-muted-foreground">
                    {t(`gardenTypes.types.${type}.description`)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* AI Workflow Enhancement Section */}
      <section className="border-t py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-4 text-center text-3xl font-bold">
              {t('workflow.title')}
            </h2>
            <p className="mb-12 text-center text-muted-foreground">
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
        </Container>
      </section>
    </div>
  );
}
