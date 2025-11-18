'use client';

import { Button } from '@/components/ui/button';
import { DownloadIcon, SparklesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface GardenDisplayProps {
  images: string[];
  timing: number | null;
  isLoading: boolean;
}

export function GardenDisplay({
  images,
  timing,
  isLoading,
}: GardenDisplayProps) {
  const t = useTranslations('AIGardenPage.display');

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      // Try to fetch with cors mode first
      const response = await fetch(imageUrl, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `garden-design-${Date.now()}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download failed, trying direct link:', error);
      // Fallback: open image in new tab for manual download
      const a = document.createElement('a');
      a.href = imageUrl;
      a.download = `garden-design-${Date.now()}-${index + 1}.png`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="animate-spin rounded-full border-4 border-primary border-t-transparent size-12" />
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
            <p className="text-xs text-muted-foreground">
              {t('empty.description')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="group relative overflow-hidden rounded-lg"
          >
            <img
              src={imageUrl}
              alt={`Garden design ${index + 1}`}
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
