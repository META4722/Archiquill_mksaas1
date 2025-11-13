import type { GenerateLandscapeRequest } from '@/ai/landscape/lib/api-types';
import { consumeCredits, hasEnoughCredits } from '@/credits/credits';
import { auth } from '@/lib/auth';
import { replicate } from '@ai-sdk/replicate';
import { experimental_generateImage as generateImage } from 'ai';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API route for generating landscape renderings from sketches
 * Supports image-to-image generation with credit consumption
 */

const TIMEOUT_MILLIS = 55 * 1000;
const CREDITS_PER_GENERATION = 5; // Cost per landscape generation

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMillis: number
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), timeoutMillis)
    ),
  ]);
};

/**
 * Style to prompt mapping for different rendering styles
 */
const getStylePrompt = (
  style: string,
  userPrompt: string
): { prompt: string; negativePrompt: string } => {
  const baseNegative =
    'low quality, blurry, distorted, ugly, bad anatomy, watermark, text';

  const styleConfigs: Record<
    string,
    { suffix: string; negative: string }
  > = {
    photorealistic: {
      suffix:
        'professional architectural photography, ultra realistic, high detail, natural lighting, 8k resolution, photorealistic rendering',
      negative: `${baseNegative}, cartoon, painting, illustration, sketch`,
    },
    artistic: {
      suffix:
        'artistic architectural rendering, beautiful composition, painterly style, atmospheric, professional concept art',
      negative: `${baseNegative}, photo, photorealistic`,
    },
    conceptual: {
      suffix:
        'architectural concept art, modern design visualization, clean lines, professional presentation',
      negative: `${baseNegative}, cluttered, messy`,
    },
    technical: {
      suffix:
        'technical architectural drawing, precise details, professional CAD rendering, clean presentation',
      negative: `${baseNegative}, artistic, painterly, abstract`,
    },
  };

  const config = styleConfigs[style] || styleConfigs.photorealistic;
  return {
    prompt: `${userPrompt}, ${config.suffix}`,
    negativePrompt: config.negative,
  };
};

export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);

  try {
    // 1. Validate request body
    const body = (await req.json()) as GenerateLandscapeRequest;
    const { prompt, sourceImage, style } = body;

    if (!prompt || !sourceImage || !style) {
      const error = 'Missing required parameters: prompt, sourceImage, or style';
      console.error(`${error} [requestId=${requestId}]`);
      return NextResponse.json({ error }, { status: 400 });
    }

    // 2. Check authentication
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user?.id) {
      console.error(`Unauthorized request [requestId=${requestId}]`);
      return NextResponse.json(
        { error: 'Please sign in to use this feature' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 3. Check credit balance
    const hasCredits = await hasEnoughCredits({
      userId,
      requiredCredits: CREDITS_PER_GENERATION,
    });

    if (!hasCredits) {
      console.error(
        `Insufficient credits [requestId=${requestId}, userId=${userId}]`
      );
      return NextResponse.json(
        {
          error: `Insufficient credits. This feature requires ${CREDITS_PER_GENERATION} credits.`,
        },
        { status: 402 }
      );
    }

    // 4. Generate landscape rendering
    const { prompt: enhancedPrompt, negativePrompt } = getStylePrompt(
      style,
      prompt
    );
    const startTime = performance.now();

    console.log(
      `Starting landscape generation [requestId=${requestId}, userId=${userId}, style=${style}]`
    );

    // Use Replicate's SDXL image-to-image model
    const modelId = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';

    const generatePromise = generateImage({
      model: replicate.image(modelId),
      prompt: enhancedPrompt,
      // Convert base64 to data URI if not already
      ...(sourceImage.startsWith('data:')
        ? { image: sourceImage }
        : { image: `data:image/jpeg;base64,${sourceImage}` }),
      providerOptions: {
        replicate: {
          negative_prompt: negativePrompt,
          num_inference_steps: 25,
          guidance_scale: 7.5,
          strength: 0.75, // How much to transform the input image
          seed: Math.floor(Math.random() * 1000000),
        },
      },
    }).then(({ image, warnings }) => {
      if (warnings?.length > 0) {
        console.warn(
          `Warnings [requestId=${requestId}, model=${modelId}]: `,
          warnings
        );
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(1);
      console.log(
        `Completed landscape generation [requestId=${requestId}, userId=${userId}, elapsed=${elapsed}s]`
      );

      return image.base64;
    });

    const imageBase64 = await withTimeout(generatePromise, TIMEOUT_MILLIS);

    // 5. Consume credits after successful generation
    await consumeCredits({
      userId,
      amount: CREDITS_PER_GENERATION,
      description: `AI Landscape Design - ${style} style`,
    });

    console.log(
      `Credits consumed [requestId=${requestId}, userId=${userId}, amount=${CREDITS_PER_GENERATION}]`
    );

    return NextResponse.json({
      image: imageBase64,
      creditsUsed: CREDITS_PER_GENERATION,
    });
  } catch (error) {
    // Log full error detail on the server
    console.error(
      `Error generating landscape [requestId=${requestId}]: `,
      error
    );

    return NextResponse.json(
      {
        error:
          'Failed to generate landscape rendering. Please try again later.',
      },
      { status: 500 }
    );
  }
}
