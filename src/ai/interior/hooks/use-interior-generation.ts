'use client';

import { useState } from 'react';
import type {
  InteriorGenerationRequest,
  InteriorGenerationResponse,
} from '../lib/interior-types';

export function useInteriorGeneration() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timing, setTiming] = useState<number | null>(null);

  const generateInterior = async (request: InteriorGenerationRequest) => {
    setIsLoading(true);
    setError(null);
    setTiming(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'interior',
          prompt: request.prompt,
          style: request.style,
          imageUrls: request.imageUrl ? [request.imageUrl] : undefined,
          aspectRatio: request.aspectRatio || '1:1',
          enhancePrompt: request.enhancePrompt !== false,
        }),
      });

      const endTime = Date.now();
      setTiming(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to generate interior design',
        }));
        throw new Error(errorData.error || 'Generation failed');
      }

      const data: InteriorGenerationResponse = await response.json();

      if (!data.success || !data.images || data.images.length === 0) {
        throw new Error('No images returned');
      }

      const imageUrls = data.images.map((img) => img.url);
      setImages(imageUrls);
      return imageUrls;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setImages([]);
    setError(null);
    setTiming(null);
  };

  return { images, isLoading, error, timing, generateInterior, reset };
}
