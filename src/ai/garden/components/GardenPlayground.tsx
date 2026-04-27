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
import { useEffect, useRef, useState } from 'react';
import {
  FREE_TRIAL_LIMIT,
  useFreeTrialCounter,
} from '../hooks/use-free-trial-counter';
import { useGardenGeneration } from '../hooks/use-garden-generation';
import { GardenDisplay } from './GardenDisplay';
import { ImageUpload } from './ImageUpload';
import { SignupPromptDialog } from './SignupPromptDialog';

type GenerationMode = 'image_to_image' | 'text_to_image';

const PENDING_PROMPT_KEY = 'archiquill_pending_prompt';

export function GardenPlayground() {
  const t = useTranslations('AIGardenPage');
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const { images, isLoading, error, timing, generateGarden } =
    useGardenGeneration();
  const trial = useFreeTrialCounter();

  const [mode, setMode] = useState<GenerationMode>('text_to_image');
  const [prompt, setPrompt] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogVariant, setDialogVariant] = useState<'soft' | 'hard'>('soft');
  const autoGenerateAttempted = useRef(false);

  const runGeneration = async (overridePrompt?: string) => {
    const finalPrompt = (overridePrompt ?? prompt).trim();
    if (!finalPrompt) return;

    try {
      await generateGarden({
        prompt: finalPrompt,
        style: 'modern',
        imageUrl: selectedImage || undefined,
        aspectRatio: '1:1',
        enhancePrompt: true,
      });
      // Only count anonymous text-to-image generations against free trial
      if (!isLoggedIn && !selectedImage) {
        trial.increment();
        // Soft prompt the moment they hit the limit
        if (trial.count + 1 >= FREE_TRIAL_LIMIT) {
          setDialogVariant('soft');
          setDialogOpen(true);
        }
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Image-to-image always requires login
    if (mode === 'image_to_image' && !isLoggedIn) {
      try {
        sessionStorage.setItem(PENDING_PROMPT_KEY, prompt.trim());
      } catch {}
      router.push('/auth/login');
      return;
    }

    // Hard block: anonymous user has used up free trials
    if (!isLoggedIn && trial.hydrated && trial.isExhausted) {
      try {
        sessionStorage.setItem(PENDING_PROMPT_KEY, prompt.trim());
      } catch {}
      setDialogVariant('hard');
      setDialogOpen(true);
      return;
    }

    await runGeneration();
  };

  // After login, auto-resume the generation the user was attempting
  useEffect(() => {
    if (sessionPending) return;
    if (!isLoggedIn) return;
    if (autoGenerateAttempted.current) return;

    let pending: string | null = null;
    try {
      pending = sessionStorage.getItem(PENDING_PROMPT_KEY);
    } catch {}
    if (!pending) return;

    autoGenerateAttempted.current = true;
    try {
      sessionStorage.removeItem(PENDING_PROMPT_KEY);
    } catch {}
    setPrompt(pending);
    runGeneration(pending);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, sessionPending]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim() && !isLoading) {
        handleGenerate();
      }
    }
  };

  const showRemainingHint =
    !isLoggedIn && trial.hydrated && mode === 'text_to_image' && !selectedImage;

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
                      ? `${t('playground.generate')} (10 ${t('playground.credits')})`
                      : t('playground.generate')}
                </>
              )}
            </Button>

            {showRemainingHint && (
              <p className="text-center text-xs text-muted-foreground">
                {trial.isExhausted
                  ? 'Free trials used up — sign up for 30 free credits'
                  : `${trial.remaining} of ${FREE_TRIAL_LIMIT} free generations remaining`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Display */}
      <div className="lg:sticky lg:top-6 lg:h-fit">
        <GardenDisplay images={images} timing={timing} isLoading={isLoading} />
      </div>

      <SignupPromptDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        variant={dialogVariant}
        giftCredits={30}
      />
    </div>
  );
}
