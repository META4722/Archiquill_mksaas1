'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useUnifiedGeneration } from './hooks/use-unified-generation';
import type { ToolType } from './tool-grid-selector';
import { ToolGridSelector } from './tool-grid-selector';
import { UnifiedGenerationControls } from './unified-generation-controls';
import { UnifiedImageDisplay } from './unified-image-display';

interface AIDashboardProps {
  userCredits: number;
}

export function AIDashboard({ userCredits }: AIDashboardProps) {
  const router = useRouter();
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const { result, isLoading, error, timing, startGeneration, reset } =
    useUnifiedGeneration();

  const handleGenerate = async (params: {
    prompt: string;
    style: string;
    imageUrl?: string;
    aspectRatio: string;
  }) => {
    if (!selectedTool) return;

    // Check if user needs to be logged in for image-to-image
    if (params.imageUrl && userCredits <= 0) {
      // Redirect to credits page
      router.push('/settings/credits');
      return;
    }

    reset();
    await startGeneration({
      type: selectedTool,
      prompt: params.prompt,
      style: params.style,
      imageUrl: params.imageUrl,
      aspectRatio: params.aspectRatio,
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Tool Grid Selector */}
        <ToolGridSelector
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          disabled={isLoading}
        />

        {/* Generation Controls */}
        <UnifiedGenerationControls
          selectedTool={selectedTool}
          onGenerate={handleGenerate}
          disabled={isLoading}
          isGenerating={isLoading}
        />
      </div>

      {/* Right Column - Image Display (Sticky) */}
      <div>
        <UnifiedImageDisplay
          imageUrl={result?.url}
          isLoading={isLoading}
          timing={timing}
          error={error}
        />
      </div>
    </div>
  );
}
