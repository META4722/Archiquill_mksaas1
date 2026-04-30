export interface InteriorStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  promptPrefix: string;
}

export interface InteriorGenerationRequest {
  prompt: string;
  style: string;
  imageUrl?: string;
  aspectRatio?: string;
  enhancePrompt?: boolean;
}

export interface InteriorGenerationResult {
  url: string;
}

export interface InteriorGenerationResponse {
  success: boolean;
  images: InteriorGenerationResult[];
  metadata?: {
    type: string;
    prompt: string;
    style?: string;
    aspectRatio?: string;
    creditsUsed: number;
    createdAt: string;
  };
  error?: string;
}
