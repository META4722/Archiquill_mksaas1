'use client';

import { LoginWrapper } from '@/components/auth/login-wrapper';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { uploadBase64FromBrowser } from '@/storage/client';
import {
  AlertCircle,
  DownloadIcon,
  ImageIcon,
  Loader2Icon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { SignupPromptDialog } from '@/ai/garden/components/SignupPromptDialog';

const PENDING_BG_IMAGE_KEY = 'archiquill_bg_removal_image';
const PENDING_BG_AUTORUN_KEY = 'archiquill_bg_removal_autorun';

export function BackgroundRemovalPlayground() {
  const t = useTranslations('AIBackgroundRemovalPage');
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [selectedImage, setSelectedImage] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoRunAttempted = useRef(false);

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = async (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB');
      return;
    }

    setError('');
    setResultUrl('');
    setIsUploading(true);

    try {
      const base64 = await fileToBase64(file);
      const uploadResult = await uploadBase64FromBrowser(base64, {
        folder: 'bg-removal-inputs',
        filename: file.name,
      });
      setSelectedImage(uploadResult.url);
      try {
        sessionStorage.setItem(PENDING_BG_IMAGE_KEY, uploadResult.url);
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const runBackgroundRemoval = async (imageUrl: string) => {
    setIsProcessing(true);
    setError('');
    setResultUrl('');

    try {
      const res = await fetch('/api/remove-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Background removal failed');
      }

      setResultUrl(data.url);
      try {
        sessionStorage.removeItem(PENDING_BG_AUTORUN_KEY);
      } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    if (!isLoggedIn) {
      try {
        sessionStorage.setItem(PENDING_BG_IMAGE_KEY, selectedImage);
        sessionStorage.setItem(PENDING_BG_AUTORUN_KEY, '1');
      } catch {}
      setDialogOpen(true);
      return;
    }

    await runBackgroundRemoval(selectedImage);
  };

  useEffect(() => {
    try {
      const savedImage = sessionStorage.getItem(PENDING_BG_IMAGE_KEY);
      if (savedImage && !selectedImage) {
        setSelectedImage(savedImage);
      }
    } catch {}
  }, [selectedImage]);

  useEffect(() => {
    if (sessionPending || !isLoggedIn || autoRunAttempted.current || isProcessing) {
      return;
    }

    let savedImage: string | null = null;
    let shouldAutorun = false;

    try {
      savedImage = sessionStorage.getItem(PENDING_BG_IMAGE_KEY);
      shouldAutorun = sessionStorage.getItem(PENDING_BG_AUTORUN_KEY) === '1';
    } catch {}

    if (!savedImage || !shouldAutorun) return;

    autoRunAttempted.current = true;
    setSelectedImage(savedImage);
    runBackgroundRemoval(savedImage);
  }, [isLoggedIn, isProcessing, sessionPending]);

  const handleDownload = () => {
    if (!resultUrl) return;
    const a = document.createElement('a');
    a.href = resultUrl;
    a.download = `bg-removed-${Date.now()}.png`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleReset = () => {
    setSelectedImage('');
    setResultUrl('');
    setError('');
    autoRunAttempted.current = false;
    try {
      sessionStorage.removeItem(PENDING_BG_IMAGE_KEY);
      sessionStorage.removeItem(PENDING_BG_AUTORUN_KEY);
    } catch {}
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Left — Upload */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">{t('playground.original')}</h2>

        {!selectedImage ? (
          <div
            className={`flex min-h-[360px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDrop={async (e) => {
              e.preventDefault();
              setIsDragging(false);
              const file = e.dataTransfer.files[0];
              if (file) await handleFile(file);
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2Icon className="size-10 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t('playground.uploading')}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="rounded-full bg-muted p-4">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">{t('playground.uploadTitle')}</p>
                  <p className="text-sm text-muted-foreground">{t('playground.uploadHint')}</p>
                </div>
                <Button variant="outline" size="sm" className="mt-2">
                  <UploadIcon className="mr-2 size-4" />
                  {t('playground.chooseFile')}
                </Button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
            />
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-xl border">
            <img src={selectedImage} alt="Original" className="w-full object-contain" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute right-2 top-2"
              onClick={handleReset}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleRemoveBackground}
          disabled={!selectedImage || isProcessing || isUploading}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2Icon className="mr-2 size-4 animate-spin" />
              {t('playground.processing')}
            </>
          ) : (
            <>
              <SparklesIcon className="mr-2 size-4" />
              {t('playground.removeBackground')}
              {!isLoggedIn && ' (Sign in required)'}
            </>
          )}
        </Button>
      </div>

      {/* Right — Result */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{t('playground.result')}</h2>

        {isProcessing ? (
          <div className="flex flex-1 min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25">
            <div className="flex flex-col items-center gap-6">
              <div className="size-14 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <div className="space-y-2 text-center">
                <p className="text-sm font-medium">{t('playground.processingTitle')}</p>
                <p className="text-xs text-muted-foreground">{t('playground.processingHint')}</p>
              </div>
            </div>
          </div>
        ) : resultUrl ? (
          <div className="flex flex-col gap-4">
            <div
              className="overflow-hidden rounded-xl border"
              style={{
                backgroundImage:
                  'linear-gradient(45deg, #e5e5e5 25%, transparent 25%), linear-gradient(-45deg, #e5e5e5 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e5e5 75%), linear-gradient(-45deg, transparent 75%, #e5e5e5 75%)',
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            >
              <img src={resultUrl} alt="Background removed" className="w-full object-contain" />
            </div>
            <Button onClick={handleDownload} className="w-full" variant="outline" size="lg">
              <DownloadIcon className="mr-2 size-4" />
              {t('playground.download')}
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 min-h-[420px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-muted-foreground/25">
            <div className="flex flex-col items-center gap-4 text-center px-8">
              <div className="rounded-full bg-muted p-5">
                <SparklesIcon className="size-10 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <p className="font-medium">{t('playground.emptyTitle')}</p>
                <p className="text-sm text-muted-foreground">{t('playground.emptyHint')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <SignupPromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant="hard"
        giftCredits={30}
      />
    </div>
  );
}
