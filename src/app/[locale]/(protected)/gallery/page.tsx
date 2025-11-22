import { UserMenu } from '@/components/dashboard/user-menu';
import LocaleSwitcher from '@/components/layout/locale-switcher';
import Container from '@/components/layout/container';
import { CreditBalance } from '@/components/blocks/ai-dashboard/credit-balance';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import { getUserGenerations } from '@/actions/generations';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { GalleryGrid } from './components/gallery-grid';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata | undefined> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return constructMetadata({
    title: `Gallery - ${t('name')}`,
    description: t('description'),
    locale,
    pathname: '/gallery',
  });
}

export default async function GalleryPage() {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's credit balance
  const credits = await getUserCredits(session.user.id);

  // Get user's generation history
  const generations = await getUserGenerations();

  const t = await getTranslations('Gallery');

  return (
    <Container className="py-8">
      {/* Top Navigation Bar */}
      <div className="mb-6 flex items-center justify-end gap-3">
        <CreditBalance credits={credits} />
        <LocaleSwitcher />
        <UserMenu
          userName={session.user.name}
          userEmail={session.user.email}
          userImage={session.user.image}
        />
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t('title')}
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            {t('subtitle')}
          </p>
        </div>

        {/* Gallery Grid */}
        <GalleryGrid generations={generations} />
      </div>
    </Container>
  );
}
