'use client';

import { useState } from 'react';
import type {
  ExteriorGenerationRequest,
  ExteriorGenerationResponse,
} from '../lib/exterior-types';

export function useExteriorGeneration() {
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timing, setTiming] = useState<number | null>(null);

  const generateExterior = async (request: ExteriorGenerationRequest) => {
    setIsLoading(true);
    setError(null);
    setTiming(null);
    const startTime = Date.now();

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'exterior',
          prompt: request.prompt,
          style: request.style,
          imageUrls: request.imageUrl ? [request.imageUrl] : undefined,
          aspectRatio: request.aspectRatio || '16:9',
          enhancePrompt: request.enhancePrompt !== false,
        }),
      });

      const endTime = Date.now();
      setTiming(endTime - startTime);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: 'Failed to generate exterior design',
        }));
        throw new Error(errorData.error || 'Generation failed');
      }

      const data: ExteriorGenerationResponse = await response.json();

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

  return { images, isLoading, error, timing, generateExterior, reset };
}
