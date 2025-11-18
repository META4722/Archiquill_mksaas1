import type { GardenStyle } from './garden-types';

/**
 * Build a complete prompt with style enhancements
 */
export function buildGardenPrompt(
  userPrompt: string,
  style: GardenStyle
): string {
  return `${style.promptPrefix}${userPrompt}, professional garden design rendering, high quality, detailed, photorealistic`;
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a JPEG, PNG, or WebP image',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Image size must be less than 10MB',
    };
  }

  return { valid: true };
}

/**
 * Get aspect ratio display name
 */
export function getAspectRatioName(ratio: string): string {
  const names: Record<string, string> = {
    '1:1': 'Square',
    '4:3': 'Standard',
    '3:4': 'Portrait',
    '3:2': 'Photo',
    '2:3': 'Portrait Photo',
    '16:9': 'Widescreen',
    '9:16': 'Vertical',
  };
  return names[ratio] || ratio;
}
