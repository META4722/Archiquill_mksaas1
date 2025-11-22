'use client';

import type { UserGeneration } from '@/actions/generations';
import { deleteGeneration } from '@/actions/generations';
import { Button } from '@/components/ui/button';
import { DownloadIcon, ImageIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface GalleryGridProps {
  generations: UserGeneration[];
}

export function GalleryGrid({ generations }: GalleryGridProps) {
  const t = useTranslations('Gallery');
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDownload = async (imageUrl: string) => {
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

  const handleDelete = async (generationId: string) => {
    if (!confirm(t('confirmDelete'))) {
      return;
    }

    try {
      setDeletingId(generationId);
      await deleteGeneration(generationId);
      router.refresh();
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete image');
    } finally {
      setDeletingId(null);
    }
  };

  if (generations.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12 text-center">
        <div className="rounded-full bg-muted p-6">
          <ImageIcon className="size-12 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">{t('empty.title')}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {generations.map((generation) => (
        <div
          key={generation.id}
          className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
        >
          {/* Image */}
          <div className="relative aspect-square w-full overflow-hidden bg-muted">
            <Image
              src={generation.imageUrl}
              alt={generation.prompt}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          </div>

          {/* Info */}
          <div className="p-4">
            {/* Prompt */}
            <p className="line-clamp-2 text-sm font-medium">
              {generation.prompt}
            </p>

            {/* Metadata */}
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="capitalize">{generation.toolType}</span>
              <span>•</span>
              <span className="capitalize">{generation.style}</span>
              <span>•</span>
              <span>{generation.aspectRatio}</span>
            </div>

            {/* Date */}
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(generation.createdAt).toLocaleDateString()}
            </p>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1"
                onClick={() => handleDownload(generation.imageUrl)}
              >
                <DownloadIcon className="mr-1 size-3" />
                {t('downloadImage')}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDelete(generation.id)}
                disabled={deletingId === generation.id}
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
