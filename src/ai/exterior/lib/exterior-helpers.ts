import type { ExteriorStyle } from './exterior-types';

export function buildExteriorPrompt(userPrompt: string, style: ExteriorStyle): string {
  return `${style.promptPrefix}${userPrompt}, professional architectural exterior rendering, high quality, detailed, photorealistic`;
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or WebP image' };
  }
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: 'Image size must be less than 10MB' };
  }
  return { valid: true };
}
