import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import Container from '@/components/layout/container';
import { auth } from '@/lib/auth';
import { constructMetadata } from '@/lib/metadata';
import { Routes } from '@/routes';
import { Building2, Flower, HomeIcon, TreesIcon } from 'lucide-react';
import type { Metadata } from 'next';
import type { Locale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
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

const tools = [
  {
    id: 'exterior',
    icon: HomeIcon,
    href: Routes.Create,
  },
  {
    id: 'interior',
    icon: Building2,
    href: Routes.Create,
  },
  {
    id: 'landscape',
    icon: TreesIcon,
    href: Routes.Create,
  },
  {
    id: 'garden',
    icon: Flower,
    href: Routes.Create,
  },
] as const;

export default async function HomePage() {
  // Get authenticated user
  const session = await auth.api.getSession({
    headers: await import('next/headers').then((m) => m.headers()),
  });

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const t = await getTranslations('DashboardHome');

  return (
    <>
      <DashboardHeader
        breadcrumbs={[{ label: t('title'), isCurrentPage: true }]}
      />

      <Container className="py-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t('title')}
            </h1>
            <p className="mt-3 text-lg text-muted-foreground">
              {t('subtitle')}
            </p>
          </div>

          {/* Tool Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative overflow-hidden rounded-xl border bg-card p-6 transition-all hover:border-primary hover:shadow-lg"
                >
                  <div className="flex flex-col items-center gap-4 text-center">
                    {/* Icon */}
                    <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 transition-transform group-hover:scale-110">
                      <Icon className="size-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-semibold">
                      {t(`tools.${tool.id}.title`)}
                    </h3>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">
                      {t(`tools.${tool.id}.description`)}
                    </p>

                    {/* Features */}
                    <ul className="w-full space-y-2 text-left text-sm">
                      {[0, 1, 2].map((index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="mt-0.5 text-primary">•</span>
                          <span>
                            {t(
                              `tools.${tool.id}.features.${index}` as Parameters<
                                typeof t
                              >[0]
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-auto w-full rounded-lg bg-primary/10 px-4 py-2 text-center text-sm font-medium text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      {t('startCreating')}
                    </div>
                  </div>

                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        </div>
      </Container>
    </>
  );
}
