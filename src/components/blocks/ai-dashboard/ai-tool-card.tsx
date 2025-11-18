'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRightIcon, LockIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

interface AIToolCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  credits: number;
  comingSoon?: boolean;
  className?: string;
}

export function AIToolCard({
  title,
  description,
  icon,
  href,
  credits,
  comingSoon = false,
  className,
}: AIToolCardProps) {
  const CardContent = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md',
        comingSoon
          ? 'cursor-not-allowed opacity-60'
          : 'hover:border-primary/50',
        className
      )}
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Content */}
      <div className="relative space-y-4">
        {/* Icon & Badge */}
        <div className="flex items-start justify-between">
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
            {icon}
          </div>
          {comingSoon ? (
            <div className="flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium">
              <LockIcon className="size-3" />
              <span>即将推出</span>
            </div>
          ) : (
            <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {credits} 积分
            </div>
          )}
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Action */}
        {!comingSoon && (
          <Button
            variant="ghost"
            size="sm"
            className="group/btn w-full justify-between"
            asChild
          >
            <div>
              <span>开始创作</span>
              <ArrowRightIcon className="size-4 transition-transform group-hover/btn:translate-x-1" />
            </div>
          </Button>
        )}
      </div>
    </div>
  );

  if (comingSoon || !href) {
    return CardContent;
  }

  return <Link href={href}>{CardContent}</Link>;
}
