/**
 * API request and response types for landscape generation
 */

import type { RenderingStyle } from './landscape-types';

export interface GenerateLandscapeRequest {
  prompt: string;
  sourceImage: string; // base64 encoded
  style: RenderingStyle;
  modelId?: string;
}

export interface GenerateLandscapeResponse {
  image?: string; // base64 encoded
  error?: string;
  creditsUsed?: number;
}
