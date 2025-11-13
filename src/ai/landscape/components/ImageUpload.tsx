'use client';

import { fileToBase64, validateImageFile } from '../lib/landscape-helpers';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ImageIcon, UploadIcon, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

interface ImageUploadProps {
  onImageSelect: (base64: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError('');

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      onImageSelect(base64);
    } catch (err) {
      setError('Failed to process image. Please try again.');
      console.error('Image processing error:', err);
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
        onClick={selectedImage ? undefined : handleClick}
      >
        {selectedImage ? (
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
              <p className="text-sm font-medium">
                {t('upload.title')}
              </p>
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

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
