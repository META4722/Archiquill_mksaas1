import { MAX_FILE_SIZE } from '@/lib/constants';
import { uploadFile } from '@/storage';
import { StorageError } from '@/storage/types';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for uploading base64 encoded images to Cloudflare R2
 *
 * Request body:
 * {
 *   "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
 *   "filename": "image.png",  // optional, will be auto-generated if not provided
 *   "folder": "uploads"       // optional, folder path in R2 bucket
 * }
 *
 * Response:
 * {
 *   "url": "https://your-r2-domain.com/uploads/uuid.png",
 *   "key": "uploads/uuid.png"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64, filename, folder } = body;

    // Validate base64 input
    if (!base64 || typeof base64 !== 'string') {
      return NextResponse.json(
        { error: 'No base64 image data provided' },
        { status: 400 }
      );
    }

    // Parse base64 string - support both with and without data URI prefix
    let base64Data: string;
    let mimeType: string;
    let fileExtension: string;

    if (base64.startsWith('data:')) {
      // Extract MIME type and base64 data from data URI
      const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid base64 data URI format' },
          { status: 400 }
        );
      }

      mimeType = matches[1];
      base64Data = matches[2];

      // Extract file extension from MIME type
      const mimeToExtension: Record<string, string> = {
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/png': 'png',
        'image/webp': 'webp',
        'image/gif': 'gif',
      };

      fileExtension = mimeToExtension[mimeType] || 'png';
    } else {
      // Plain base64 string without data URI prefix
      // Default to PNG if no MIME type is specified
      base64Data = base64;
      mimeType = 'image/png';
      fileExtension = 'png';
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];
    if (!allowedTypes.includes(mimeType)) {
      return NextResponse.json(
        {
          error: `File type ${mimeType} not supported. Allowed types: ${allowedTypes.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, 'base64');

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      const sizeMB = (buffer.length / (1024 * 1024)).toFixed(2);
      const maxSizeMB = (MAX_FILE_SIZE / (1024 * 1024)).toFixed(2);
      return NextResponse.json(
        {
          error: `File size (${sizeMB}MB) exceeds the maximum limit of ${maxSizeMB}MB`,
        },
        { status: 400 }
      );
    }

    // Generate filename if not provided
    const finalFilename = filename || `image-${Date.now()}.${fileExtension}`;

    // Upload to R2
    const result = await uploadFile(
      buffer,
      finalFilename,
      mimeType,
      folder || undefined
    );

    console.log('uploadBase64, result', result);

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      size: buffer.length,
      mimeType,
    });
  } catch (error) {
    console.error('Error uploading base64 image:', error);

    if (error instanceof StorageError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Something went wrong while uploading the image';

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Configuration for Next.js API route
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  maxDuration: 30, // 30 seconds timeout
};
