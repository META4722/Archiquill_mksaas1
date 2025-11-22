'use client';

import { useState } from 'react';
import type { ToolType } from '../tool-grid-selector';

interface GenerationParams {
  type: ToolType;
  prompt: string;
  style?: string;
  imageUrl?: string;
  aspectRatio?: string;
}

interface GenerationResult {
  url: string;
  metadata?: {
    type: string;
    prompt: string;
    style?: string;
    aspectRatio?: string;
    creditsUsed: number;
    createdAt: string;
  };
}

interface UseUnifiedGenerationReturn {
  result: GenerationResult | null;
  isLoading: boolean;
  error: string | null;
  timing: number | null;
  startGeneration: (params: GenerationParams) => Promise<void>;
  reset: () => void;
}

export function useUnifiedGeneration(): UseUnifiedGenerationReturn {
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timing, setTiming] = useState<number | null>(null);

  const startGeneration = async (params: GenerationParams) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTiming(null);

    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: params.type,
          prompt: params.prompt,
          style: params.style,
          imageUrls: params.imageUrl ? [params.imageUrl] : undefined,
          aspectRatio: params.aspectRatio || '1:1',
          enhancePrompt: true,
        }),
      });

      const endTime = Date.now();
      const elapsedTime = (endTime - startTime) / 1000;
      setTiming(elapsedTime);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();

      if (data.success && data.images && data.images.length > 0) {
        setResult({
          url: data.images[0].url,
          metadata: data.metadata,
        });
      } else {
        throw new Error('No image generated');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setTiming(null);
    setIsLoading(false);
  };

  return {
    result,
    isLoading,
    error,
    timing,
    startGeneration,
    reset,
  };
}
