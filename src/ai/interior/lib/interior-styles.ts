import type { InteriorStyle } from './interior-types';

export const INTERIOR_STYLES: InteriorStyle[] = [
  {
    id: 'modern',
    name: 'Modern Minimalist',
    nameZh: '现代简约',
    description: 'Clean lines, neutral palette, and uncluttered spaces',
    descriptionZh: '线条简洁，中性色调，空间整洁',
    icon: '▪️',
    promptPrefix: 'modern minimalist interior design, clean lines, neutral tones, uncluttered, ',
  },
  {
    id: 'scandinavian',
    name: 'Scandinavian',
    nameZh: '北欧风格',
    description: 'Light woods, white walls, cozy textures, and functional beauty',
    descriptionZh: '浅色木材，白色墙壁，舒适质感，功能美学',
    icon: '🪵',
    promptPrefix: 'Scandinavian interior design, light wood, white walls, hygge, cozy, functional, ',
  },
  {
    id: 'industrial',
    name: 'Industrial',
    nameZh: '工业风',
    description: 'Exposed brick, metal accents, and raw materials',
    descriptionZh: '裸露砖墙，金属元素，原始材料',
    icon: '🏭',
    promptPrefix: 'industrial interior design, exposed brick, metal accents, raw materials, loft style, ',
  },
  {
    id: 'japandi',
    name: 'Japandi',
    nameZh: '日式侘寂',
    description: 'Japanese-Scandinavian fusion with wabi-sabi aesthetics',
    descriptionZh: '日式与北欧融合，侘寂美学',
    icon: '🎋',
    promptPrefix: 'Japandi interior design, wabi-sabi, natural materials, zen, minimalist warmth, ',
  },
  {
    id: 'luxury',
    name: 'Luxury Classic',
    nameZh: '奢华古典',
    description: 'Rich materials, ornate details, and timeless elegance',
    descriptionZh: '丰富材质，精致细节，永恒优雅',
    icon: '✨',
    promptPrefix: 'luxury classic interior design, rich materials, ornate details, elegant, high-end, ',
  },
  {
    id: 'bohemian',
    name: 'Bohemian',
    nameZh: '波西米亚',
    description: 'Eclectic mix of patterns, textures, and global influences',
    descriptionZh: '折衷图案，多元质感，全球风情',
    icon: '🌿',
    promptPrefix: 'bohemian interior design, eclectic, layered textiles, plants, warm colors, global decor, ',
  },
];

export const DEFAULT_INTERIOR_STYLE = INTERIOR_STYLES[0];

export function getInteriorStyleById(id: string): InteriorStyle | undefined {
  return INTERIOR_STYLES.find((style) => style.id === id);
}
