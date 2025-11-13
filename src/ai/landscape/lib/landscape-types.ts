/**
 * Type definitions for AI Landscape Design feature
 */

export interface GeneratedLandscape {
  id: string;
  image: string; // base64 encoded
  modelId: string;
  prompt: string;
  sourceImage?: string;
  style: RenderingStyle;
  createdAt: Date;
}

export interface LandscapeResult {
  landscape?: GeneratedLandscape;
  error?: string;
  timing?: number; // milliseconds
}

export interface LandscapeError {
  modelId: string;
  error: string;
}

export interface ProviderTiming {
  modelId: string;
  timing: number;
}

export type RenderingStyle =
  | 'photorealistic'
  | 'artistic'
  | 'conceptual'
  | 'technical';

export const RENDERING_STYLES: Array<{
  value: RenderingStyle;
  labelKey: string;
  descriptionKey: string;
}> = [
  {
    value: 'photorealistic',
    labelKey: 'photorealistic.label',
    descriptionKey: 'photorealistic.description',
  },
  {
    value: 'artistic',
    labelKey: 'artistic.label',
    descriptionKey: 'artistic.description',
  },
  {
    value: 'conceptual',
    labelKey: 'conceptual.label',
    descriptionKey: 'conceptual.description',
  },
  {
    value: 'technical',
    labelKey: 'technical.label',
    descriptionKey: 'technical.description',
  },
];
