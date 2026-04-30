'use client';

import { Button } from '@/components/ui/button';
import { DownloadIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InteriorDisplayProps {
  images: string[];
  timing: number | null;
  isLoading: boolean;
}

export function InteriorDisplay({ images, timing, isLoading }: InteriorDisplayProps) {
  const t = useTranslations('AIInteriorPage.display');

  const handleDownload = (imageUrl: string, index: number) => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `interior-design-${Date.now()}-${index + 1}.png`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('generating')}</p>
            <p className="text-xs text-muted-foreground">{t('pleaseWait')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-muted p-4">
            <SparklesIcon className="size-8 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">{t('empty.title')}</p>
            <p className="text-xs text-muted-foreground">{t('empty.description')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {timing && (
        <p className="text-xs text-muted-foreground text-right">
          {t('timing', { seconds: (timing / 1000).toFixed(1) })}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4">
        {images.map((imageUrl, index) => (
          <div key={index} className="group relative overflow-hidden rounded-lg">
            <img
              src={imageUrl}
              alt={`Interior design ${index + 1}`}
              className="w-full rounded-lg object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-end gap-2 p-4 opacity-0 transition-opacity group-hover:opacity-100">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDownload(imageUrl, index)}
              >
                <DownloadIcon className="mr-2 size-4" />
                {t('download')}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
