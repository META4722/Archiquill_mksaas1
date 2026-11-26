'use client';

import { Compare } from '@/components/ui/compare';
import { useTranslations } from 'next-intl';

const features = [
  {
    id: 1,
    sketchImage: '/images/archi/design-freedom-sketch.jpg',
    renderImage: '/images/archi/design-freedom-render.jpg',
  },
  {
    id: 2,
    sketchImage: '/images/archi/quick-idea-sketch.jpeg',
    renderImage: '/images/archi/quick-idea-render.jpg',
  },
  {
    id: 3,
    sketchImage: '/images/archi/Archi_sketch_image2.jpg',
    renderImage: '/images/archi/Archi_Render_image2_1.jpg',
  },
  {
    id: 4,
    sketchImage: '/images/archi/Archi_Plan_Image1.jpg',
    renderImage: '/images/archi/Archi_Plan_Flux_Image1.jpg',
  },
] as const;

export default function Features() {
  const t = useTranslations('HomePage.showcaseFeatures');
  return (
    <div id="features" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
            {t('title')}
          </p>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="space-y-24">
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.sketchImage}
              feature={feature}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const FeatureSection = ({
  feature,
  index,
}: { feature: (typeof features)[number]; index: number }) => {
  const t = useTranslations('HomePage.showcaseFeatures');
  const item = `items.${feature.id}` as const;
  const isEven = index % 2 === 0;

  return (
    <div className="relative">
      <div
        className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${!isEven ? 'lg:grid-flow-col-dense' : ''}`}
      >
        {/* 图片部分 */}
        <div className={`relative ${!isEven ? 'lg:col-start-2' : ''}`}>
          <div className="relative flex justify-center">
            <Compare
              firstImage={feature.sketchImage}
              secondImage={feature.renderImage}
              firstImageClassName="object-cover"
              secondImageClassname="object-cover"
              className="h-[400px] w-[500px] md:h-[500px] md:w-[600px] rounded-2xl"
              slideMode="hover"
              showHandlebar={true}
              autoplay={false}
            />
          </div>
        </div>

        {/* 文字部分 */}
        <div className={`${!isEven ? 'lg:col-start-1' : ''}`}>
          <div className="max-w-xl">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              {t(`${item}.title`)}
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {t(`${item}.description`)}
            </p>
            <ul className="space-y-3">
              {(t.raw(`${item}.details`) as string[]).map((detail, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3" />
                  <span className="text-muted-foreground">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
