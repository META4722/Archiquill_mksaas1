import type { ExteriorStyle } from './exterior-types';

export const EXTERIOR_STYLES: ExteriorStyle[] = [
  {
    id: 'modern',
    name: 'Modern Contemporary',
    nameZh: '现代当代',
    description: 'Flat roofs, large windows, and clean geometric forms',
    descriptionZh: '平屋顶，大窗户，简洁几何形态',
    icon: '🏢',
    promptPrefix: 'modern contemporary exterior architecture, flat roof, large windows, clean lines, geometric, ',
  },
  {
    id: 'traditional',
    name: 'Traditional Classic',
    nameZh: '传统古典',
    description: 'Timeless architectural details with pitched roofs and symmetry',
    descriptionZh: '永恒建筑细节，坡屋顶，对称设计',
    icon: '🏛️',
    promptPrefix: 'traditional classic exterior architecture, pitched roof, symmetrical, brick facade, timeless, ',
  },
  {
    id: 'mediterranean',
    name: 'Mediterranean Villa',
    nameZh: '地中海别墅',
    description: 'Terracotta roofs, stucco walls, and arched openings',
    descriptionZh: '陶土屋顶，灰泥墙壁，拱形开口',
    icon: '🌊',
    promptPrefix: 'Mediterranean villa exterior, terracotta roof tiles, stucco walls, arched windows, warm tones, ',
  },
  {
    id: 'farmhouse',
    name: 'Modern Farmhouse',
    nameZh: '现代农舍',
    description: 'Board and batten siding, metal roofs, and rustic charm',
    descriptionZh: '竖板墙板，金属屋顶，乡村魅力',
    icon: '🏡',
    promptPrefix: 'modern farmhouse exterior, board and batten siding, metal roof, white paint, rustic charm, ',
  },
  {
    id: 'industrial',
    name: 'Industrial Loft',
    nameZh: '工业阁楼',
    description: 'Exposed steel, brick, and large factory-style windows',
    descriptionZh: '裸露钢材，砖墙，大型工厂风格窗户',
    icon: '🏭',
    promptPrefix: 'industrial loft exterior, exposed steel structure, brick facade, large factory windows, urban, ',
  },
  {
    id: 'tropical',
    name: 'Tropical Resort',
    nameZh: '热带度假',
    description: 'Open pavilions, natural materials, and lush surroundings',
    descriptionZh: '开放式亭台，天然材料，郁郁葱葱的环境',
    icon: '🌴',
    promptPrefix: 'tropical resort exterior architecture, open pavilion, natural wood, thatched roof, lush vegetation, ',
  },
];

export const DEFAULT_EXTERIOR_STYLE = EXTERIOR_STYLES[0];

export function getExteriorStyleById(id: string): ExteriorStyle | undefined {
  return EXTERIOR_STYLES.find((style) => style.id === id);
}
