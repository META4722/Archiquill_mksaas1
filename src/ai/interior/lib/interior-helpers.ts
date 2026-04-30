import type { InteriorStyle } from './interior-types';

export function buildInteriorPrompt(userPrompt: string, style: InteriorStyle): string {
  return `${style.promptPrefix}${userPrompt}, professional interior design rendering, high quality, detailed, photorealistic`;
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
