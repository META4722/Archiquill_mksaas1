'use client';

import { useLandscapeGeneration } from '../hooks/use-landscape-generation';
import type { RenderingStyle } from '../lib/landscape-types';
import { getRandomSuggestions } from '../lib/suggestions';
import { ImageUpload } from './ImageUpload';
import { LandscapeDisplay } from './LandscapeDisplay';
import { PromptInput } from './PromptInput';
import { StyleSelect } from './StyleSelect';
import { useState } from 'react';

interface LandscapePlaygroundProps {
  initialSuggestions: string[];
}

export function LandscapePlayground({
  initialSuggestions,
}: LandscapePlaygroundProps) {
  const [sourceImage, setSourceImage] = useState<string>('');
  const [selectedStyle, setSelectedStyle] =
    useState<RenderingStyle>('photorealistic');
  const [suggestions, setSuggestions] = useState<string[]>(initialSuggestions);

  const { result, error, isLoading, timing, startGeneration, reset } =
    useLandscapeGeneration();

  const handlePromptSubmit = async (prompt: string) => {
    if (!sourceImage) {
      return;
    }

    reset();
    await startGeneration({
      prompt,
      sourceImage,
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
        <ImageUpload
          onImageSelect={setSourceImage}
          selectedImage={sourceImage}
          disabled={isLoading}
        />

        <StyleSelect
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          disabled={isLoading}
        />

        <PromptInput
          onSubmit={handlePromptSubmit}
          disabled={isLoading || !sourceImage}
          suggestions={suggestions}
          onRefreshSuggestions={handleRefreshSuggestions}
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
