import AIToolsSection from '@/components/blocks/ai-tools/ai-tools';
import BlogPreviewSection from '@/components/blocks/blog-preview/blog-preview';
import CallToActionSection from '@/components/blocks/calltoaction/calltoaction';
import DesignSoftwareSection from '@/components/blocks/design-software/design-software';
import FaqSection from '@/components/blocks/faqs/faqs';
import FeaturesSection from '@/components/blocks/features/features';
import HeroSection from '@/components/blocks/hero/hero';
import PricingSection from '@/components/blocks/pricing/pricing';
import CrispChat from '@/components/layout/crisp-chat';
import { NewsletterCard } from '@/components/newsletter/newsletter-card';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

/**
 * https://next-intl.dev/docs/environments/actions-metadata-route-handlers#metadata-api
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: t('title'),
    description: t('description'),
    locale,
    pathname: '',
  });
}

interface HomePageProps {
  params: Promise<{ locale: Locale }>;
}

export default async function HomePage(props: HomePageProps) {
  const params = await props.params;
  const { locale } = params;
  const t = await getTranslations('HomePage');

  return (
    <>
      <div className="flex flex-col">
        <HeroSection />

        <DesignSoftwareSection />

        <AIToolsSection />

        <FeaturesSection />

        <PricingSection />

        <FaqSection />

        <BlogPreviewSection />

        <CallToActionSection />

        <NewsletterCard />

        <CrispChat />
      </div>
    </>
  );
}
