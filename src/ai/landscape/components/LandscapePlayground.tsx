'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useLandscapeGeneration } from '../hooks/use-landscape-generation';
import type { RenderingStyle } from '../lib/landscape-types';
import { getRandomSuggestions } from '../lib/suggestions';
import { ImageUpload } from './ImageUpload';
import { LandscapeDisplay } from './LandscapeDisplay';
import { PromptInput } from './PromptInput';
import { StyleSelect } from './StyleSelect';

type GenerationMode = 'image_to_image' | 'text_to_image';

interface LandscapePlaygroundProps {
  initialSuggestions: string[];
}

export function LandscapePlayground({
  initialSuggestions,
}: LandscapePlaygroundProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;

  const [mode, setMode] = useState<GenerationMode>('image_to_image');
  const [sourceImage, setSourceImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] =
    useState<RenderingStyle>('photorealistic');
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);

  const { result, error, isLoading, timing, startGeneration, reset } =
    useLandscapeGeneration();

  const handlePromptSubmit = async (prompt: string) => {
    // For image_to_image mode, require login
    if (mode === 'image_to_image') {
      if (!isLoggedIn) {
        // Redirect to login page
        router.push('/auth/login');
        return;
      }
      if (!sourceImage) {
        return;
      }
    }

    reset();
    await startGeneration({
      prompt,
      sourceImage: mode === 'image_to_image' ? sourceImage : undefined,
      style: selectedStyle,
    });
  };

  const handleRefreshSuggestions = () => {
    setSuggestions(getRandomSuggestions(4));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column - Input Controls */}
      <div className="space-y-6">
        {/* Mode Tabs */}
        <div className="rounded-lg border bg-card p-4">
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as GenerationMode)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image_to_image">Image to Image</TabsTrigger>
              <TabsTrigger value="text_to_image">Text to Image</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Image Upload - Only show for Image to Image mode */}
        {mode === 'image_to_image' && (
          <ImageUpload
            onImageSelect={setSourceImage}
            selectedImage={sourceImage}
            disabled={isLoading}
          />
        )}

        <StyleSelect
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          disabled={isLoading}
        />

        <PromptInput
          onSubmit={handlePromptSubmit}
          disabled={isLoading || (mode === 'image_to_image' && !sourceImage)}
          suggestions={suggestions}
          onRefreshSuggestions={handleRefreshSuggestions}
          mode={mode}
          isLoggedIn={isLoggedIn}
        />
      </div>

      {/* Right Column - Result Display */}
      <div>
        <LandscapeDisplay
          result={result}
          isLoading={isLoading}
          timing={timing}
        />
      </div>
    </div>
  );
}
