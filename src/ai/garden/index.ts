export { GardenPlayground } from './components/GardenPlayground';
export { GardenDisplay } from './components/GardenDisplay';
export { ImageUpload } from './components/ImageUpload';
export { StyleSelect } from './components/StyleSelect';
export { useGardenGeneration } from './hooks/use-garden-generation';
export {
  GARDEN_STYLES,
  DEFAULT_GARDEN_STYLE,
  getGardenStyleById,
} from './lib/garden-styles';
export type {
  GardenStyle,
  GardenGenerationRequest,
  GardenGenerationResponse,
} from './lib/garden-types';
