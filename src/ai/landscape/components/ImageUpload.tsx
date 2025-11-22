'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { uploadBase64FromBrowser } from '@/storage/client';
import { ImageIcon, Loader2Icon, UploadIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { fileToBase64, validateImageFile } from '../lib/landscape-helpers';

interface ImageUploadProps {
  onImageSelect: (imageUrl: string) => void;
  selectedImage?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onImageSelect,
  selectedImage,
  disabled,
}: ImageUploadProps) {
  const t = useTranslations('AILandscapePage');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Convert file to base64 first
      const base64 = await fileToBase64(file);

      // Upload to R2 and get the URL
      const uploadResult = await uploadBase64FromBrowser(base64, {
        folder: 'landscape-sketches',
        filename: file.name,
      });

      // Pass the R2 URL to parent component
      onImageSelect(uploadResult.url);
      console.log('Image uploaded to R2:', uploadResult.url);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to process image. Please try again.';
      setError(errorMessage);
      console.error('Image processing error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const handleRemove = () => {
    onImageSelect('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={selectedImage || isUploading ? undefined : handleClick}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <Loader2Icon className="size-8 text-muted-foreground animate-spin" />
            </div>
            <p className="text-sm font-medium">上传中...</p>
          </div>
        ) : selectedImage ? (
          <>
            <img
              src={selectedImage}
              alt="Selected sketch"
              className="h-full w-full rounded-lg object-contain"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleRemove}
              disabled={disabled}
            >
              <XIcon className="size-4" />
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-full bg-muted p-3">
              <ImageIcon className="size-8 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">{t('upload.title')}</p>
              <p className="text-xs text-muted-foreground">
                {t('upload.description')}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              disabled={disabled}
            >
              <UploadIcon className="mr-2 size-4" />
              {t('upload.button')}
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInput}
          disabled={disabled}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
