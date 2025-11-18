'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertCircleIcon,
  ClockIcon,
  DownloadIcon,
  LoaderIcon,
  ShareIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  generateLandscapeFileName,
  shareOrDownload,
} from '../lib/landscape-helpers';
import type { LandscapeResult } from '../lib/landscape-types';

interface LandscapeDisplayProps {
  result: LandscapeResult | null;
  isLoading: boolean;
  timing: number | null;
  className?: string;
}

export function LandscapeDisplay({
  result,
  isLoading,
  timing,
  className,
}: LandscapeDisplayProps) {
  const t = useTranslations('AILandscapePage.result');

  const handleDownload = async () => {
    if (!result?.landscape) return;

    const fileName = generateLandscapeFileName(result.landscape.style);
    await shareOrDownload(
      result.landscape.image,
      fileName,
      'ArchiQuill Landscape Rendering'
    );
  };

  if (!isLoading && !result) {
    return null;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="text-lg">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
            <div className="flex flex-col items-center gap-3 text-center">
              <LoaderIcon className="size-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{t('generating')}</p>
            </div>
          </div>
        )}

        {result?.error && (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg border-2 border-dashed border-destructive/50 bg-destructive/5">
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <AlertCircleIcon className="size-8 text-destructive" />
              <p className="text-sm font-medium text-destructive">
                {t('error')}
              </p>
              <p className="text-xs text-muted-foreground">{result.error}</p>
            </div>
          </div>
        )}

        {result?.landscape && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-lg border">
              <img
                src={
                  result.landscape.image.startsWith('data:')
                    ? result.landscape.image
                    : `data:image/png;base64,${result.landscape.image}`
                }
                alt="Generated landscape"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        )}
      </CardContent>

      {(result?.landscape || timing) && (
        <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {timing && (
              <>
                <ClockIcon className="size-3" />
                <span>
                  {t('timing', { seconds: (timing / 1000).toFixed(1) })}
                </span>
              </>
            )}
          </div>

          {result?.landscape && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <ShareIcon className="size-3" />
                {t('share')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <DownloadIcon className="size-3" />
                {t('download')}
              </Button>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
