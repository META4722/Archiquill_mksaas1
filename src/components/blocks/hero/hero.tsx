'use client';

import { LocaleLink } from '@/i18n/navigation';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { Routes } from '@/routes';
import { motion } from 'framer-motion';
import React from 'react';

export default function HeroSection() {
  const { data: session } = authClient.useSession();
  const isLoggedIn = !!session?.user;
  const linkPrimary = isLoggedIn ? Routes.Home : Routes.Register;

  // Animation variants for the text content
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
    },
  };

  // ArchiQuill showcase images
  const images = [
    '/images/archi/Archi_Render_Flux_Max.png',
    '/images/archi/Archi_Sketch_Flux_Pro.png',
    '/images/archi/design-freedom-render.jpg',
    '/images/archi/quick-idea-render.jpg',
    '/images/archi/render-generate.jpg',
    '/images/archi/Archi_Render_image2_1.jpg',
  ];

  // Duplicate images for a seamless loop
  const duplicatedImages = [...images, ...images];

  return (
    <section
      id="hero"
      className={cn(
        'relative w-full h-screen overflow-hidden bg-[#E9E5D9] flex flex-col items-center justify-start text-center px-4 pt-32'
      )}
    >
      <div className="z-10 flex flex-col items-center">
        {/* Tagline */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-3 inline-block rounded-full border border-[#A98950]/30 bg-white/50 px-4 py-1.5 text-sm font-medium text-[#3C4242] backdrop-blur-sm"
        >
          AI-Powered Architectural Rendering
        </motion.div>

        {/* Main Title */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="text-3xl md:text-5xl xl:text-6xl font-bold tracking-tighter text-[#3C4242]"
        >
          {'10-Second AI Photorealistic Rendering'.split(' ').map((word, i) => (
            <motion.span
              key={i}
              variants={FADE_IN_ANIMATION_VARIANTS}
              className="inline-block"
            >
              {word}&nbsp;
            </motion.span>
          ))}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-4 max-w-xl text-base md:text-lg text-[#3C4242]/80"
        >
          Let Design Back To Design. Transform architectural sketches into
          professional renderings in seconds.
        </motion.p>

        {/* Call to Action Button */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LocaleLink
              href={linkPrimary}
              className="mt-6 inline-block px-8 py-3 rounded-full bg-[#A98950] text-white font-semibold shadow-lg transition-colors hover:bg-[#8B6F3E] focus:outline-none focus:ring-2 focus:ring-[#A98950] focus:ring-opacity-75"
            >
              Get 20 Points for Free
            </LocaleLink>
          </motion.div>
        </motion.div>
      </div>

      {/* Animated Image Marquee */}
      <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <motion.div
          className="flex gap-4"
          animate={{
            x: ['0%', '-50%'],
            transition: {
              ease: 'linear',
              duration: 40,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: 'loop' as const,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 5}deg`,
              }}
            >
              <img
                src={src}
                alt={`ArchiQuill showcase ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
