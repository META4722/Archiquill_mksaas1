'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Building2, Flower2, Home, Image, Palette, Trees } from 'lucide-react';
import { useTranslations } from 'next-intl';

const aiTools = [
  {
    id: 1,
    icon: Palette,
  },
  {
    id: 2,
    icon: Building2,
  },
  {
    id: 3,
    icon: Home,
  },
  {
    id: 4,
    icon: Image,
  },
  {
    id: 5,
    icon: Trees,
  },
  {
    id: 6,
    icon: Flower2,
  },
] as const;

export default function AIToolsSection() {
  const t = useTranslations('HomePage.showcaseTools');
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-[#3C4242] mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-[#3C4242]/70 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </motion.div>

        {/* AI Tools Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {aiTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <motion.div
                key={tool.id}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                className={cn(
                  'group relative p-8 rounded-2xl border border-[#A98950]/20',
                  'bg-gradient-to-br from-white to-[#E9E5D9]/30',
                  'hover:border-[#A98950]/40 hover:shadow-xl',
                  'transition-all duration-300 cursor-pointer'
                )}
              >
                {/* Icon */}
                <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-xl bg-[#A98950]/10 text-[#A98950] group-hover:bg-[#A98950] group-hover:text-white transition-all duration-300">
                  <Icon className="w-8 h-8" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#3C4242] mb-3">
                  {t(`items.${tool.id}.title`)}
                </h3>
                <p className="text-[#3C4242]/70 leading-relaxed">
                  {t(`items.${tool.id}.description`)}
                </p>

                {/* Hover Effect - Arrow */}
                <div className="mt-4 flex items-center text-[#A98950] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm font-semibold">{t('tryNow')}</span>
                  <svg
                    className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
