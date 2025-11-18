'use client';

import { Button } from '@/components/ui/button';
import { Routes } from '@/routes';
import { CoinsIcon, PlusIcon } from 'lucide-react';
import Link from 'next/link';

interface CreditBalanceProps {
  credits: number;
  showAddButton?: boolean;
}

export function CreditBalance({
  credits,
  showAddButton = true,
}: CreditBalanceProps) {
  return (
    <div className="rounded-xl border bg-gradient-to-br from-primary/10 to-background p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CoinsIcon className="size-6" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">可用积分</p>
            <p className="text-3xl font-bold">{credits.toLocaleString()}</p>
          </div>
        </div>

        {showAddButton && (
          <Button size="sm" asChild>
            <Link href={Routes.SettingsCredits}>
              <PlusIcon className="mr-2 size-4" />
              购买积分
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
