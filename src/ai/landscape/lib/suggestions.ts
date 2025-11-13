/**
 * Prompt suggestions for landscape design
 */

const BASE_PROMPTS = [
  'Modern minimalist garden with clean lines and geometric patterns',
  'Lush tropical landscape with palm trees and water features',
  'Zen garden with rocks, gravel, and carefully placed plants',
  'Mediterranean courtyard with olive trees and terracotta',
  'Contemporary rooftop garden with urban skyline views',
  'Natural woodland garden with native plants and meandering paths',
  'Formal French garden with symmetrical hedges and fountains',
  'Desert landscape with succulents and natural stone',
  'Japanese garden with koi pond and red bridge',
  'English cottage garden with wildflowers and climbing roses',
  'Sustainable eco-garden with rain garden and pollinator plants',
  'Modern courtyard with water wall and ornamental grasses',
  'Rustic farmhouse garden with vegetable beds and fruit trees',
  'Tropical resort pool area with cabanas and palm trees',
  'Mountain retreat landscape with alpine plants and rock features',
  'Coastal garden with dune grass and weathered wood',
  'Urban pocket park with multi-level seating areas',
  'Residential front yard with welcoming curved pathway',
  'Commercial plaza with sculptural trees and modern lighting',
  'Community garden with raised beds and gathering spaces',
];

const ENHANCEMENT_PHRASES = [
  'high quality architectural rendering',
  'photorealistic visualization',
  'professional landscape architecture',
  'daytime natural lighting',
  'detailed textures and materials',
  'cinematic composition',
];

/**
 * Get random landscape design suggestions
 */
export function getRandomSuggestions(count = 4): string[] {
  const shuffled = [...BASE_PROMPTS].sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  return selected.map((prompt) => {
    const enhancement =
      ENHANCEMENT_PHRASES[
        Math.floor(Math.random() * ENHANCEMENT_PHRASES.length)
      ];
    return `${prompt}, ${enhancement}`;
  });
}
