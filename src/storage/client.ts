import type { UploadFileResult } from './types';

const API_STORAGE_UPLOAD = '/api/storage/upload';
const API_STORAGE_UPLOAD_BASE64 = '/api/storage/upload-base64';

/**
 * Response type for base64 upload
 */
export interface UploadBase64Result extends UploadFileResult {
  success: boolean;
  size: number;
  mimeType: string;
}

/**
 * Uploads a file from the browser to the storage provider
 * This function is meant to be used in client components
 *
 * Note: Since s3mini doesn't support presigned URLs, all uploads
 * go through the direct upload API endpoint regardless of file size.
 *
 * @param file - The file object from an input element
 * @param folder - Optional folder path to store the file in
 * @returns Promise with the URL of the uploaded file
 */
export const uploadFileFromBrowser = async (
  file: File,
  folder?: string
): Promise<UploadFileResult> => {
  try {
    // With s3mini, we use direct upload for all file sizes
    // since presigned URLs are not supported
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder || '');

    const response = await fetch(API_STORAGE_UPLOAD, {
      method: 'POST',
      body: formData,
    });

    console.log('uploadFileFromBrowser, response', response);

    if (!response.ok) {
      // Handle 413 error specifically (Request Entity Too Large)
      if (response.status === 413) {
        throw new Error('File size exceeds the server limit');
      }

      // Try to parse JSON error response, fallback to status text if parsing fails
      let errorMessage = 'Failed to upload file';
      try {
        const errorData = (await response.json()) as {
          error?: string;
          message?: string;
        };
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = 'Failed to upload file';
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during file upload';
    throw new Error(message);
  }
};

/**
 * Uploads a base64 encoded image to the storage provider
 * This function is meant to be used in client components
 *
 * @param base64 - Base64 encoded image string (with or without data URI prefix)
 * @param options - Upload options
 * @param options.filename - Optional filename (will be auto-generated if not provided)
 * @param options.folder - Optional folder path to store the file in
 * @returns Promise with the upload result including URL and metadata
 *
 * @example
 * // With data URI prefix
 * const result = await uploadBase64FromBrowser(
 *   'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
 *   { folder: 'uploads' }
 * );
 *
 * @example
 * // Without data URI prefix (defaults to PNG)
 * const result = await uploadBase64FromBrowser(
 *   'iVBORw0KGgoAAAANSUhEUgAA...',
 *   { filename: 'my-image.png', folder: 'uploads' }
 * );
 */
export const uploadBase64FromBrowser = async (
  base64: string,
  options?: {
    filename?: string;
    folder?: string;
  }
): Promise<UploadBase64Result> => {
  try {
    const response = await fetch(API_STORAGE_UPLOAD_BASE64, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64,
        filename: options?.filename,
        folder: options?.folder,
      }),
    });

    console.log('uploadBase64FromBrowser, response', response);

    if (!response.ok) {
      // Handle 413 error specifically (Request Entity Too Large)
      if (response.status === 413) {
        throw new Error('Image size exceeds the server limit');
      }

      // Try to parse JSON error response
      let errorMessage = 'Failed to upload image';
      try {
        const errorData = (await response.json()) as {
          error?: string;
          message?: string;
        };
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        errorMessage = 'Failed to upload image';
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error occurred during base64 upload';
    throw new Error(message);
  }
};
