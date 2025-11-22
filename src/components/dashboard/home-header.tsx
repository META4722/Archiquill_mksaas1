'use client';

import LocaleSwitcher from '@/components/layout/locale-switcher';
import { useTranslations } from 'next-intl';

interface HomeHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

export function HomeHeader({ userName, userEmail }: HomeHeaderProps) {
  const t = useTranslations('Dashboard.home');
  const displayName = userName || userEmail || 'User';

  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold">
          👋 {t('welcome', { name: displayName })}
        </h1>
        <p className="mt-2 text-muted-foreground">{t('description')}</p>
      </div>
      <LocaleSwitcher />
    </div>
  );
}
