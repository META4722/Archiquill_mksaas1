'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { authClient } from '@/lib/auth-client';
import { AlertCircle, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useGardenGeneration } from '../hooks/use-garden-generation';
import { GardenDisplay } from './GardenDisplay';
import { ImageUpload } from './ImageUpload';

type GenerationMode = 'image_to_image' | 'text_to_image';

export function GardenPlayground() {
  const t = useTranslations('AIGardenPage');
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const { images, isLoading, error, timing, generateGarden } =
    useGardenGeneration();

  const [mode, setMode] = useState<GenerationMode>('text_to_image');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      return;
    }

    // For image_to_image mode, require login
    if (mode === 'image_to_image' && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }

    try {
      await generateGarden({
        prompt: prompt.trim(),
        style: 'modern',
        imageUrl: selectedImage || undefined,
        aspectRatio: '1:1',
        enhancePrompt: true,
      });
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        handleGenerate();
      }
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Left Panel - Controls */}
      <div className="space-y-6">
        <div className="rounded-xl border bg-card p-6 shadow-sm sm:p-8">
          {/* Mode Tabs */}
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as GenerationMode)}
            className="mb-8"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image_to_image">Image to Image</TabsTrigger>
              <TabsTrigger value="text_to_image">Text to Image</TabsTrigger>
            </TabsList>
          </Tabs>

          <h2 className="mb-8 text-xl font-bold">
            {mode === 'image_to_image' ? 'Image to Image' : 'Text to Image'}
          </h2>

          <div className="space-y-8">
            {/* Prompt Input */}
            <div className="space-y-3">
              <Label htmlFor="prompt" className="text-sm font-medium">
                Prompt
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Example: A modern Japanese zen garden with smooth white pebbles, carefully raked patterns, minimalist rock arrangements, and a small bamboo water feature in the corner"
                disabled={isLoading}
                className="min-h-[120px] resize-none"
                maxLength={1500}
              />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{t('prompt.hint')}</span>
                <span>{prompt.length} / 1500</span>
              </div>
            </div>

            {/* Image Upload - Only for Image to Image mode */}
            {mode === 'image_to_image' && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  {t('upload.label')}
                </Label>
                <ImageUpload
                  onImageSelect={setSelectedImage}
                  selectedImage={selectedImage}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="mt-2 w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="mr-2 size-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  {t('playground.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  {mode === 'text_to_image'
                    ? `${t('playground.generate')} (Free)`
                    : isLoggedIn
                      ? `${t('playground.generate')} (5 ${t('playground.credits')})`
                      : t('playground.generate')}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Display */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <GardenDisplay images={images} timing={timing} isLoading={isLoading} />
      </div>
    </div>
  );
}
