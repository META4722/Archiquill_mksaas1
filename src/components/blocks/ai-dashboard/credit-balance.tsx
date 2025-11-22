'use client';

import { Routes } from '@/routes';
import { CoinsIcon } from 'lucide-react';
import Link from 'next/link';

interface CreditBalanceProps {
  credits: number;
}

export function CreditBalance({ credits }: CreditBalanceProps) {
  return (
    <Link
      href={Routes.SettingsCredits}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-card px-3 py-2 text-sm shadow-sm transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-1.5">
        <span className="font-medium">{credits}</span>
        <CoinsIcon className="size-3.5" />
      </div>
    </Link>
  );
}
