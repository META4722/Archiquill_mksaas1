import type { GardenStyle } from './garden-types';

export const GARDEN_STYLES: GardenStyle[] = [
  {
    id: 'zen',
    name: 'Japanese Zen',
    nameZh: '日式禅意',
    description:
      'Peaceful Japanese zen garden with rocks, raked gravel, and minimal plants',
    descriptionZh: '宁静的日式禅意花园，配有岩石、耙纹砾石和简约植物',
    icon: '🎋',
    promptPrefix:
      'Japanese zen garden style, minimalist, peaceful, rocks and gravel, ',
  },
  {
    id: 'cottage',
    name: 'English Cottage',
    nameZh: '英式庭院',
    description:
      'Charming English cottage garden with colorful flowers and natural pathways',
    descriptionZh: '迷人的英式庭院花园，色彩缤纷的花朵和自然小径',
    icon: '🌸',
    promptPrefix:
      'English cottage garden style, colorful flowers, natural, romantic, ',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    nameZh: '现代简约',
    description:
      'Contemporary garden design with clean lines and geometric patterns',
    descriptionZh: '现代简约花园设计，线条清晰，几何图案',
    icon: '▪️',
    promptPrefix:
      'Modern minimalist garden design, clean lines, geometric, contemporary, ',
  },
  {
    id: 'tropical',
    name: 'Tropical Paradise',
    nameZh: '热带天堂',
    description: 'Lush tropical garden with exotic plants and vibrant colors',
    descriptionZh: '郁郁葱葱的热带花园，异国植物，色彩鲜艳',
    icon: '🌴',
    promptPrefix:
      'Tropical paradise garden, lush vegetation, exotic plants, vibrant, ',
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean',
    nameZh: '地中海风格',
    description:
      'Mediterranean garden with terracotta, olive trees, and warm colors',
    descriptionZh: '地中海花园，陶土色调，橄榄树，温暖色彩',
    icon: '🫒',
    promptPrefix:
      'Mediterranean garden style, terracotta, olive trees, warm earth tones, ',
  },
  {
    id: 'desert',
    name: 'Desert Landscape',
    nameZh: '沙漠景观',
    description: 'Drought-tolerant desert garden with cacti and succulents',
    descriptionZh: '耐旱沙漠花园，仙人掌和多肉植物',
    icon: '🌵',
    promptPrefix:
      'Desert landscape garden, drought-tolerant, cacti, succulents, arid, ',
  },
];

export const DEFAULT_GARDEN_STYLE = GARDEN_STYLES[0];

export function getGardenStyleById(id: string): GardenStyle | undefined {
  return GARDEN_STYLES.find((style) => style.id === id);
}
