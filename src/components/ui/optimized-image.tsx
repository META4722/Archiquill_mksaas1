import Image, { type ImageProps } from 'next/image';

/**
 * OptimizedImage component
 *
 * Wrapper around next/image with optimized defaults for performance
 * Automatically uses modern formats (AVIF, WebP) and lazy loading
 */
interface OptimizedImageProps extends Omit<ImageProps, 'loading'> {
  /**
   * Loading strategy
   * - 'lazy': Load when near viewport (default)
   * - 'eager': Load immediately (for above-the-fold images)
   */
  priority?: boolean;
}

export function OptimizedImage({
  alt,
  quality = 85,
  priority = false,
  placeholder = 'blur',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  return (
    <Image
      alt={alt}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      placeholder={blurDataURL || props.src ? placeholder : 'empty'}
      {...props}
    />
  );
}

/**
 * Hero image with optimized settings for large hero images
 */
export function HeroImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      priority
      quality={90}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
      {...props}
    />
  );
}

/**
 * Thumbnail with aggressive optimization
 */
export function ThumbnailImage(props: OptimizedImageProps) {
  return (
    <OptimizedImage
      quality={75}
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      {...props}
    />
  );
}
