'use client';

import { Compare } from '@/components/ui/compare';

const features = [
  {
    name: 'Design Freedom',
    description:
      'Unleash your creative potential without the limitations of traditional design tools. Through our AI-driven design system, every idea can be freely expressed, creating unique and personalized visual works.',
    details: [
      'Unlimited creative expression space',
      'Intelligent design suggestions and optimization',
      'Personalized visual style customization',
    ],
    sketchImage: '/images/archi/design-freedom-sketch.jpg',
    renderImage: '/images/archi/design-freedom-render.jpg',
  },
  {
    name: 'Quick Idea Forming',
    description:
      'Rapidly transform inspiration into concrete design concepts. Our intelligent algorithms understand your creative intent, helping you form complete design ideas and solutions in the shortest time.',
    details: [
      'Instant inspiration capture and transformation',
      'Smart concept generation algorithms',
      'Rapid prototyping tools',
    ],
    sketchImage: '/images/archi/quick-idea-sketch.jpeg',
    renderImage: '/images/archi/quick-idea-render.jpg',
  },
  {
    name: 'Generate Idea in minutes',
    description:
      'Generate complete design solutions within minutes. From concept to finished product, AI assistant will accompany you through the entire creative process, making design more efficient and enjoyable.',
    details: [
      'Fast solution generation engine',
      'AI-assisted design workflow',
      'Efficient creative experience',
    ],
    sketchImage: '/images/archi/Archi_sketch_image2.jpg',
    renderImage: '/images/archi/Archi_Render_image2_1.jpg',
  },
  {
    name: 'Real-time AO Map Rendering',
    description:
      'Direct AO map rendering technology for efficient rendering workflows. Output high-quality ambient occlusion maps directly without complex post-processing, dramatically improving rendering efficiency and visual quality.',
    details: [
      'Direct AO map output without post-processing',
      'Optimized high-efficiency rendering engine',
      'Real-time ambient occlusion calculation',
    ],
    sketchImage: '/images/archi/Archi_Plan_Image1.jpg',
    renderImage: '/images/archi/Archi_Plan_Flux_Image1.jpg',
  },
];

export default function Features() {
  return (
    <div id="features" className="bg-background py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <p className="mt-2 text-4xl font-semibold tracking-tight text-pretty text-foreground sm:text-5xl lg:text-balance">
            Unleash Creativity, Make Design Simple
          </p>
          <p className="mt-6 text-lg/8 text-muted-foreground">
            Through artificial intelligence technology, we provide designers and
            creators with a brand new creative experience. From inspiration to
            finished work, every step is full of possibilities.
          </p>
        </div>
        <div className="space-y-24">
          {features.map((feature, index) => (
            <FeatureSection
              key={feature.name}
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
}: { feature: (typeof features)[0]; index: number }) => {
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
              {feature.name}
            </h3>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              {feature.description}
            </p>
            <ul className="space-y-3">
              {feature.details.map((detail, idx) => (
                <li key={idx} className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-2 mr-3"></div>
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
