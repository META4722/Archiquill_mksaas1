export interface ExteriorStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  promptPrefix: string;
}

export interface ExteriorGenerationRequest {
  prompt: string;
  style: string;
  imageUrl?: string;
  aspectRatio?: string;
  enhancePrompt?: boolean;
}

export interface ExteriorGenerationResult {
  url: string;
}

export interface ExteriorGenerationResponse {
  success: boolean;
  images: ExteriorGenerationResult[];
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
