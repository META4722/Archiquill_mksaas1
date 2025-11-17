'use client';

import { AnimatedGroup } from '@/components/tailark/motion/animated-group';
import { TextEffect } from '@/components/tailark/motion/text-effect';
import { Button } from '@/components/ui/button';
import { Compare } from '@/components/ui/compare';
import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { Routes } from '@/routes';

const transitionVariants = {
  item: {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.95,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: 'spring',
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export default function HeroSection() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const linkPrimary = isLoggedIn ? Routes.Home : Routes.Register;

  return (
    <>
      <main id="hero" className="overflow-hidden">
        <section className="py-20 lg:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Text content */}
              <div className="space-y-6">
                <AnimatedGroup variants={transitionVariants}>
                  <TextEffect
                    per="word"
                    preset="fade-in-blur"
                    speedSegment={0.2}
                    as="h1"
                    className="text-3xl lg:text-4xl xl:text-5xl font-bold tracking-tight"
                  >
                    10-Second AI Photorealistic Rendering
                  </TextEffect>
                </AnimatedGroup>

                <AnimatedGroup variants={transitionVariants}>
                  <TextEffect
                    per="word"
                    preset="fade-in-blur"
                    speedSegment={0.2}
                    delay={0.3}
                    as="p"
                    className="text-xl lg:text-2xl text-muted-foreground font-medium"
                  >
                    Let Design Back To Design
                  </TextEffect>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.6,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                >
                  <Button
                    asChild
                    size="lg"
                    className="rounded-xl px-6 text-base h-12"
                  >
                    <LocaleLink href={linkPrimary}>
                      Get 20 Points for Free
                    </LocaleLink>
                  </Button>
                </AnimatedGroup>
              </div>

              {/* Right side - Compare component */}
              <AnimatedGroup
                variants={{
                  container: {
                    visible: {
                      transition: {
                        delayChildren: 0.8,
                      },
                    },
                  },
                  ...transitionVariants,
                }}
              >
                <div className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100 border-neutral-200 dark:border-neutral-800">
                  <Compare
                    firstImage="/images/archi/Archi_Sketch_Flux_Pro.png"
                    secondImage="/images/archi/Archi_Render_Flux_Max.png"
                    firstImageClassName="object-cover object-center"
                    secondImageClassname="object-cover object-center"
                    className="h-[250px] w-full md:h-[500px]"
                    slideMode="hover"
                  />
                </div>
              </AnimatedGroup>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
