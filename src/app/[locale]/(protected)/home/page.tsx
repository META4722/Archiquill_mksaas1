import { AIDashboard } from '@/components/blocks/ai-dashboard';
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
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          👋 欢迎回来, {session.user.name || session.user.email}
        </h1>
        <p className="mt-2 text-muted-foreground">
          开始使用 AI 工具创作精美的设计作品
        </p>
      </div>

      <AIDashboard userCredits={credits} />
    </Container>
  );
}
