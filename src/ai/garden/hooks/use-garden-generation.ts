'use client';

import { useState } from 'react';
import type {
  GardenGenerationRequest,
  GardenGenerationResponse,
} from '../lib/garden-types';

export function useGardenGeneration() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timing, setTiming] = useState<number | null>(null);

  const generateGarden = async (request: GardenGenerationRequest) => {
    setIsLoading(true);
    setError(null);
    setTiming(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'garden',
          prompt: request.prompt,
          style: request.style,
          imageUrls: request.imageUrl ? [request.imageUrl] : undefined,
          aspectRatio: request.aspectRatio || '16:9',
          enhancePrompt: request.enhancePrompt !== false, // Default true
        }),
      });

      const endTime = Date.now();
      setTiming(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to generate garden design',
        }));
        throw new Error(errorData.error || 'Generation failed');
      }

      const data: GardenGenerationResponse = await response.json();

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

  return {
    images,
    isLoading,
    error,
    timing,
    generateGarden,
    reset,
  };
}
