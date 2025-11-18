/**
 * Helper utilities for landscape generation
 */

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(base64: string, mimeType = 'image/png'): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Convert File to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Share or download landscape image
 */
export async function shareOrDownload(
  imageSource: string,
  fileName: string,
  title: string
): Promise<void> {
  let blob: Blob;

  // Check if it's a URL or base64
  if (imageSource.startsWith('http://') || imageSource.startsWith('https://')) {
    // It's a URL, fetch the image
    try {
      const response = await fetch(imageSource, {
        mode: 'cors',
        credentials: 'omit',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }

      blob = await response.blob();
    } catch (error) {
      console.error('Download failed, trying direct link:', error);
      // Fallback: open in new tab
      const a = document.createElement('a');
      a.href = imageSource;
      a.download = fileName;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
  } else {
    // It's base64
    blob = base64ToBlob(imageSource);
  }

  const file = new File([blob], fileName, { type: 'image/png' });

  // Try Web Share API first (mobile-friendly)
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
        title,
      });
      return;
    } catch (error) {
      // User cancelled or share failed, fall through to download
      if ((error as Error).name !== 'AbortError') {
        console.error('Share failed:', error);
      }
    }
  }

  // Fallback to download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate unique filename for landscape render
 */
export function generateLandscapeFileName(style: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `archiquill-landscape-${style}-${timestamp}.png`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.',
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File too large. Maximum size is 10MB.',
    };
  }

  return { valid: true };
}

/**
 * Resize image if needed
 */
export async function resizeImage(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Create canvas and resize
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
}
