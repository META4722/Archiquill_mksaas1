import { auth } from '@/lib/auth';
import { type NextRequest, NextResponse } from 'next/server';

const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
const MODEL_VERSION = '851-labs/background-remover';
const POLL_INTERVAL = 1500;
const MAX_ATTEMPTS = 60;

async function pollPrediction(predictionId: string): Promise<string> {
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const res = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        },
      }
    );

    if (!res.ok) throw new Error('Failed to poll prediction status');

    const data = await res.json();

    if (data.status === 'succeeded') {
      const outputUrl = Array.isArray(data.output) ? data.output[0] : data.output;
      if (!outputUrl) throw new Error('No output URL in response');
      return outputUrl;
    }

    if (data.status === 'failed' || data.status === 'canceled') {
      throw new Error(data.error || 'Background removal failed');
    }

    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
  }

  throw new Error('Background removal timed out');
}

export async function POST(req: NextRequest) {
  try {
    if (!REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: 'Replicate API token not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing required field: imageUrl' },
        { status: 400 }
      );
    }

    // Require login for this feature
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Please sign in to use background removal' },
        { status: 401 }
      );
    }

    // Create prediction
    const createRes = await fetch('https://api.replicate.com/v1/models/851-labs/background-remover/predictions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        Prefer: 'wait',
      },
      body: JSON.stringify({
        input: {
          image: imageUrl,
        },
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      console.error('Replicate create error:', err);
      return NextResponse.json(
        { error: 'Failed to start background removal' },
        { status: 500 }
      );
    }

    const prediction = await createRes.json();

    // If Prefer: wait returned a completed result immediately
    if (prediction.status === 'succeeded') {
      const outputUrl = Array.isArray(prediction.output)
        ? prediction.output[0]
        : prediction.output;
      return NextResponse.json({ success: true, url: outputUrl });
    }

    // Otherwise poll
    const outputUrl = await pollPrediction(prediction.id);
    return NextResponse.json({ success: true, url: outputUrl });
  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Background removal failed' },
      { status: 500 }
    );
  }
}
