'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadBase64FromBrowser } from '@/storage/client';
import { ImageIcon, Loader2Icon, UploadIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { validateImageFile } from '../lib/interior-helpers';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
  disabled?: boolean;
}

export function ImageUpload({ onImageSelect, selectedImage, disabled }: ImageUploadProps) {
  const t = useTranslations('AIInteriorPage.upload');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    setError('');
    setIsUploading(true);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      setIsUploading(false);
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      const uploadResult = await uploadBase64FromBrowser(base64, {
        folder: 'interior-references',
        filename: file.name,
      });
      onImageSelect(uploadResult.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleRemove = () => {
    onImageSelect('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="w-full space-y-2">
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors',
          isDragging && 'border-primary bg-primary/5',
          !isDragging && 'border-muted-foreground/25 hover:border-primary/50',
          disabled && 'cursor-not-allowed opacity-50',
          !disabled && 'cursor-pointer',
          selectedImage && 'aspect-video'
        )}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={selectedImage || isUploading ? undefined : () => !disabled && fileInputRef.current?.click()}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">上传中...</p>
          </div>
        ) : selectedImage ? (
          <>
            <img src={selectedImage} alt="Selected reference" className="h-full w-full rounded-lg object-contain" />
            <Button type="button" variant="destructive" size="icon" className="absolute right-2 top-2" onClick={handleRemove} disabled={disabled}>
              <XIcon className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('title')}</p>
              <p className="text-xs text-muted-foreground">{t('description')}</p>
            </div>
            <Button type="button" variant="outline" size="sm" className="mt-2" disabled={disabled}>
              <UploadIcon className="mr-2 size-4" />
              {t('button')}
            </Button>
          </div>
        )}
        <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} disabled={disabled} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
