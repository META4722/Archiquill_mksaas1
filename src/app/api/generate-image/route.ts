import { consumeCredits, hasEnoughCredits } from '@/credits/credits';
import { getDb } from '@/db';
import { userGeneration } from '@/db/schema';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';
import { type NextRequest, NextResponse } from 'next/server';

// Evolink AI API configuration
const EVOLINK_API_URL = 'https://api.evolink.ai/v1/images/generations';
const EVOLINK_API_KEY =
  process.env.EVOLINK_API_KEY ||
  'sk-T9q6Qk7jAAmjHbbmunrxkuT1K9xIMXs4TZEH2aIT5ef0Jji8';
const EVOLINK_MODEL = 'gemini-2.5-flash-image';

// Credit costs per generation type
const CREDIT_COSTS = {
  landscape: 5,
  garden: 5,
  sketch: 5,
  exterior: 5,
  interior: 5,
} as const;

// Type definitions
type GenerationType = keyof typeof CREDIT_COSTS;

interface GenerateImageRequest {
  type: GenerationType;
  prompt: string;
  style?: string;
  imageUrls?: string[];
  aspectRatio?: string;
  enhancePrompt?: boolean;
}

interface EvolinkTaskResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  created: number;
  model?: string;
  object?: string;
  type?: string;
  task_info?: {
    can_cancel: boolean;
    estimated_time?: number;
  };
  results?: string[]; // Array of image URLs
  result?: {
    images: Array<{
      url: string;
    }>;
  };
}

// Map aspect ratios to Evolink format
function mapAspectRatio(ratio?: string): string {
  const ratioMap: Record<string, string> = {
    '1:1': '1:1',
    '4:3': '4:3',
    '3:4': '3:4',
    '3:2': '3:2',
    '2:3': '2:3',
    '16:9': '16:9',
    '9:16': '9:16',
  };
  return ratioMap[ratio || '16:9'] || '16:9';
}

// Enhance prompt based on generation type and style
function enhancePromptForType(
  prompt: string,
  type: GenerationType,
  style?: string
): string {
  const typeEnhancements: Record<GenerationType, string> = {
    landscape: 'Professional landscape architecture visualization, ',
    garden: 'Beautiful garden design rendering, ',
    sketch: 'Architectural sketch to photorealistic rendering, ',
    exterior: 'Exterior architectural design visualization, ',
    interior: 'Interior design rendering, ',
  };

  const styleEnhancements: Record<string, string> = {
    realistic: 'photorealistic, high detail, professional photography',
    night: 'dramatic night scene, atmospheric lighting, moonlight',
    snow: 'winter scene, snow covered, cold atmosphere',
    rain: 'rainy weather, wet surfaces, dramatic clouds',
    modern: 'modern contemporary style, clean lines',
    minimalist: 'minimalist design, simple elegant',
    neoclassical: 'neoclassical style, classical elegance',
    industrial: 'industrial style, raw materials',
    zen: 'Japanese zen garden, peaceful, minimalist',
    cottage: 'English cottage garden, colorful flowers, natural',
    tropical: 'tropical paradise, lush vegetation, exotic plants',
    mediterranean: 'Mediterranean style, terracotta, olive trees',
  };

  let enhanced = typeEnhancements[type] + prompt;

  if (style && styleEnhancements[style.toLowerCase()]) {
    enhanced += ', ' + styleEnhancements[style.toLowerCase()];
  }

  return enhanced;
}

// Poll task status until completion
async function pollTaskStatus(taskId: string): Promise<EvolinkTaskResponse> {
  const maxAttempts = 60; // 60 attempts * 2 seconds = 2 minutes max
  const pollInterval = 2000; // 2 seconds

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`https://api.evolink.ai/v1/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${EVOLINK_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to check task status: ${response.statusText}`);
    }

    const taskData: EvolinkTaskResponse = await response.json();
    console.log(
      `Polling attempt ${attempt + 1}: Status=${taskData.status}, Progress=${taskData.progress}`
    );

    if (taskData.status === 'completed') {
      console.log('Task completed, returning data');
      return taskData;
    }

    if (taskData.status === 'failed') {
      throw new Error('Image generation failed');
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error('Image generation timed out');
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse request body first to determine if it's a free request
    const body: GenerateImageRequest = await req.json();
    const { type, prompt, style, imageUrls, aspectRatio, enhancePrompt } = body;

    // Validate required fields
    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: type and prompt' },
        { status: 400 }
      );
    }

    if (!CREDIT_COSTS[type]) {
      return NextResponse.json(
        { error: `Invalid generation type: ${type}` },
        { status: 400 }
      );
    }

    // Determine if this is a free text-to-image request (no imageUrls provided)
    const isFreeTextToImage = !imageUrls || imageUrls.length === 0;

    // 2. Authenticate user (only required for image-to-image)
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    // For image-to-image (paid), require authentication
    if (!isFreeTextToImage && !session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in to use Image to Image.' },
        { status: 401 }
      );
    }

    // 3. Check credit balance (only for image-to-image)
    if (!isFreeTextToImage && session?.user?.id) {
      const requiredCredits = CREDIT_COSTS[type];
      const hasCredits = await hasEnoughCredits({
        userId: session.user.id,
        requiredCredits,
      });

      if (!hasCredits) {
        return NextResponse.json(
          {
            error: 'Insufficient credits',
            required: requiredCredits,
          },
          { status: 402 }
        );
      }
    }

    // 4. Enhance prompt if requested
    const finalPrompt = enhancePrompt
      ? enhancePromptForType(prompt, type, style)
      : prompt;

    // 5. Filter out base64 URLs (Evolink doesn't support them)
    // Only include HTTP/HTTPS URLs
    const validImageUrls = imageUrls?.filter(
      (url) => url.startsWith('http://') || url.startsWith('https://')
    );

    // 6. Call Evolink API to create generation task
    const evolinkResponse = await fetch(EVOLINK_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${EVOLINK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: EVOLINK_MODEL,
        prompt: finalPrompt,
        size: mapAspectRatio(aspectRatio),
        ...(validImageUrls &&
          validImageUrls.length > 0 && { image_urls: validImageUrls }),
      }),
    });

    if (!evolinkResponse.ok) {
      const errorData = await evolinkResponse.json().catch(() => ({}));
      console.error('Evolink API error:', errorData);
      return NextResponse.json(
        {
          error: 'Failed to generate image',
          details: errorData,
        },
        { status: 500 }
      );
    }

    const taskData: EvolinkTaskResponse = await evolinkResponse.json();
    console.log('Initial task data:', JSON.stringify(taskData, null, 2));

    // 7. Poll for task completion
    const completedTask = await pollTaskStatus(taskData.id);

    // Log the full response to debug
    console.log(
      'Completed task response:',
      JSON.stringify(completedTask, null, 2)
    );

    // Check for images in either results array or result.images
    const generatedImageUrls =
      completedTask.results ||
      completedTask.result?.images?.map((img) => img.url) ||
      [];

    if (generatedImageUrls.length === 0) {
      throw new Error('No images returned from generation');
    }

    // 8. Consume credits after successful generation (only for image-to-image)
    const creditsUsed = isFreeTextToImage ? 0 : CREDIT_COSTS[type];
    if (!isFreeTextToImage && session?.user?.id) {
      await consumeCredits({
        userId: session.user.id,
        amount: CREDIT_COSTS[type],
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} image generation`,
      });
    }

    // 9. Save generation to database (only for logged-in users)
    if (session?.user?.id) {
      const db = await getDb();
      const firstImageUrl = generatedImageUrls[0];
      const sourceImageUrl =
        validImageUrls && validImageUrls.length > 0
          ? validImageUrls[0]
          : undefined;

      await db.insert(userGeneration).values({
        id: nanoid(),
        userId: session.user.id,
        imageUrl:
          typeof firstImageUrl === 'string' ? firstImageUrl : firstImageUrl,
        prompt: finalPrompt,
        toolType: type,
        style: style || 'realistic',
        aspectRatio: mapAspectRatio(aspectRatio),
        sourceImageUrl,
        creditsUsed,
      });
    }

    // 10. Return generated images
    return NextResponse.json({
      success: true,
      images: generatedImageUrls.map((url) => ({
        url: typeof url === 'string' ? url : url,
      })),
      metadata: {
        type,
        prompt: finalPrompt,
        style,
        aspectRatio: mapAspectRatio(aspectRatio),
        creditsUsed,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to generate image',
      },
      { status: 500 }
    );
  }
}
