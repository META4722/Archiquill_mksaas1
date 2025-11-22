import { AIDashboard } from '@/components/blocks/ai-dashboard';
import { CreditBalance } from '@/components/blocks/ai-dashboard/credit-balance';
import { UserMenu } from '@/components/dashboard/user-menu';
import LocaleSwitcher from '@/components/layout/locale-switcher';
import Container from '@/components/layout/container';
import { getUserCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';

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
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  // Get user's credit balance
  const credits = await getUserCredits(session.user.id);

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
      <AIDashboard userCredits={credits} />
    </Container>
  );
}
