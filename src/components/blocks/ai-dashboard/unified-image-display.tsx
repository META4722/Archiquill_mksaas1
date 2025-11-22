'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DownloadIcon, Loader2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

interface UnifiedImageDisplayProps {
  imageUrl?: string;
  isLoading?: boolean;
  timing?: number | null;
  error?: string | null;
  className?: string;
}

export function UnifiedImageDisplay({
  imageUrl,
  isLoading = false,
  timing,
  error,
  className,
}: UnifiedImageDisplayProps) {
  const t = useTranslations('Dashboard.home.unifiedGeneration.display');

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `archiquill-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  return (
    <div
      className={cn(
        'flex h-full min-h-[500px] flex-col rounded-lg border bg-card lg:sticky lg:top-6',
        className
      )}
    >
      <div className="flex-1 p-6">
        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <Loader2Icon className="size-12 animate-spin text-primary" />
            <p className="text-sm font-medium text-muted-foreground">
              {t('loading')}
            </p>
          </div>
        ) : error ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-destructive/10 p-4">
              <svg
                className="size-8 text-destructive"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
        ) : imageUrl ? (
          <div className="space-y-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-muted">
              <Image
                src={imageUrl}
                alt="Generated design"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>

            {timing && (
              <p className="text-center text-sm text-muted-foreground">
                {t('timing', { time: timing.toFixed(1) })}
              </p>
            )}

            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <DownloadIcon className="mr-2 size-4" />
              {t('download')}
            </Button>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
            <div className="rounded-full bg-muted p-4">
              <svg
                className="size-12 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="font-medium">{t('empty')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('emptyDescription')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
