'use client';

import type {
  GenerateLandscapeRequest,
  GenerateLandscapeResponse,
} from '../lib/api-types';
import type { LandscapeError, LandscapeResult } from '../lib/landscape-types';
import { useState } from 'react';

/**
 * Custom hook for managing landscape generation state and API calls
 */
export function useLandscapeGeneration() {
  const [result, setResult] = useState<LandscapeResult | null>(null);
  const [error, setError] = useState<LandscapeError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timing, setTiming] = useState<number | null>(null);

  const startGeneration = async (request: GenerateLandscapeRequest) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setTiming(null);

    const startTime = performance.now();

    try {
      const response = await fetch('/api/generate-landscape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const endTime = performance.now();
      const timeTaken = Math.round(endTime - startTime);
      setTiming(timeTaken);

      const data: GenerateLandscapeResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      if (data.error) {
        setError({
          modelId: request.modelId || 'default',
          error: data.error,
        });
        setResult({ error: data.error });
      } else if (data.image) {
        setResult({
          landscape: {
            id: `landscape-${Date.now()}`,
            image: data.image,
            modelId: request.modelId || 'default',
            prompt: request.prompt,
            sourceImage: request.sourceImage,
            style: request.style,
            createdAt: new Date(),
          },
          timing: timeTaken,
        });
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError({
        modelId: request.modelId || 'default',
        error: errorMessage,
      });
      setResult({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsLoading(false);
    setTiming(null);
  };

  return {
    result,
    error,
    isLoading,
    timing,
    startGeneration,
    reset,
  };
}
