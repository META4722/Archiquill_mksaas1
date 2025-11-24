'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { uploadBase64FromBrowser } from '@/storage/client';
import {
  ImageIcon,
  Loader2Icon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import type { ToolType } from './tool-grid-selector';

interface UnifiedGenerationControlsProps {
  selectedTool: ToolType | null;
  onGenerate: (params: {
    prompt: string;
    style: string;
    imageUrl?: string;
    aspectRatio: string;
  }) => void;
  disabled?: boolean;
  isGenerating?: boolean;
}

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1' },
  { value: '4:3', label: '4:3' },
  { value: '3:4', label: '3:4' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
];

const STYLES = [
  { value: 'photorealistic', labelKey: 'photorealistic' },
  { value: 'artistic', labelKey: 'artistic' },
  { value: 'conceptual', labelKey: 'conceptual' },
  { value: 'technical', labelKey: 'technical' },
];

function validateImageFile(file: File) {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPEG, PNG, or WebP image',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }

  return { valid: true };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function UnifiedGenerationControls({
  selectedTool,
  onGenerate,
  disabled = false,
  isGenerating = false,
}: UnifiedGenerationControlsProps) {
  const t = useTranslations('Dashboard.home.unifiedGeneration.controls');
  const tStyles = useTranslations('Dashboard.home.unifiedGeneration.styles');

  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('photorealistic');
  const [selectedAspectRatio, setSelectedAspectRatio] = useState('1:1');
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError('');
    setIsUploading(true);

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      setIsUploading(false);
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      const uploadResult = await uploadBase64FromBrowser(base64, {
        folder: 'unified-generation',
        filename: file.name,
      });
      setUploadedImage(uploadResult.url);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to process image. Please try again.';
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled || isGenerating) return;
    const file = e.dataTransfer.files[0];
    if (file) await handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isGenerating) setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await handleFile(file);
  };

  const handleRemoveImage = () => {
    setUploadedImage('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!selectedTool || !prompt.trim()) return;

    onGenerate({
      prompt: prompt.trim(),
      style: selectedStyle,
      imageUrl: uploadedImage || undefined,
      aspectRatio: selectedAspectRatio,
    });
  };

  const isDisabled = disabled || isGenerating;
  const canGenerate = selectedTool && prompt.trim().length > 0;

  // Get placeholder text based on selected tool
  const getPlaceholder = () => {
    if (!selectedTool) return t('promptPlaceholder.default');
    return t(`promptPlaceholder.${selectedTool}`);
  };

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      {!selectedTool ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {t('selectToolFirst')}
          </p>
        </div>
      ) : (
        <>
          {/* Style Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('styleLabel')}</Label>
            <RadioGroup
              value={selectedStyle}
              onValueChange={setSelectedStyle}
              disabled={isDisabled}
              className="grid grid-cols-2 gap-3"
            >
              {STYLES.map((style) => (
                <Label
                  key={style.value}
                  htmlFor={style.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors hover:border-primary',
                    selectedStyle === style.value &&
                      'border-primary bg-primary/5',
                    isDisabled && 'cursor-not-allowed opacity-50'
                  )}
                >
                  <RadioGroupItem
                    value={style.value}
                    id={style.value}
                    disabled={isDisabled}
                  />
                  <span className="text-sm font-medium">
                    {tStyles(style.labelKey as any)}
                  </span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('uploadLabel')}</Label>
            <div
              className={cn(
                'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors',
                isDragging && 'border-primary bg-primary/5',
                !isDragging &&
                  'border-muted-foreground/25 hover:border-primary/50',
                isDisabled && 'cursor-not-allowed opacity-50',
                !isDisabled && 'cursor-pointer',
                uploadedImage && 'aspect-video'
              )}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={
                uploadedImage || isUploading
                  ? undefined
                  : () => fileInputRef.current?.click()
              }
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
                  <p className="text-sm font-medium">{t('uploading')}</p>
                </div>
              ) : uploadedImage ? (
                <>
                  <img
                    src={uploadedImage}
                    alt="Uploaded"
                    className="h-full w-full rounded-lg object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute right-2 top-2"
                    onClick={handleRemoveImage}
                    disabled={isDisabled}
                  >
                    <XIcon className="size-4" />
                  </Button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-center">
                  <ImageIcon className="size-8 text-muted-foreground" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{t('uploadTitle')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('uploadDescription')}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    disabled={isDisabled}
                  >
                    <UploadIcon className="mr-2 size-4" />
                    {t('uploadButton')}
                  </Button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileInput}
                disabled={isDisabled}
              />
            </div>
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
          </div>

          {/* Prompt Input */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">{t('promptLabel')}</Label>
            <Textarea
              placeholder={getPlaceholder()}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isDisabled}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Aspect Ratio Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              {t('aspectRatioLabel')}
            </Label>
            <div className="flex flex-wrap gap-2">
              {ASPECT_RATIOS.map((ratio) => (
                <Button
                  key={ratio.value}
                  type="button"
                  variant={
                    selectedAspectRatio === ratio.value ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => setSelectedAspectRatio(ratio.value)}
                  disabled={isDisabled}
                >
                  {ratio.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleSubmit}
            disabled={!canGenerate || isDisabled}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <SparklesIcon className="mr-2 size-4" />
                {uploadedImage
                  ? t('generateButton', { credits: 10 })
                  : t('generateButtonFree')}
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}
