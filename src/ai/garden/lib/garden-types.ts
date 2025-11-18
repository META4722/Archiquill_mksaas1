export interface GardenStyle {
  id: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  icon: string;
  promptPrefix: string;
}

export interface GardenGenerationRequest {
  prompt: string;
  style: string;
  imageUrl?: string;
  aspectRatio?: string;
  enhancePrompt?: boolean;
}

export interface GardenGenerationResult {
  url: string;
}

export interface GardenGenerationResponse {
  success: boolean;
  images: GardenGenerationResult[];
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
