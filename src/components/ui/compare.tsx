'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { cn } from '@/lib/utils';

interface CompareProps {
  firstImage?: string;
  secondImage?: string;
  firstImageClassName?: string;
  secondImageClassname?: string;
  className?: string;
  slideMode?: 'hover' | 'drag';
  showHandlebar?: boolean;
  autoplay?: boolean;
  autoplayDuration?: number;
}

export const Compare = ({
  firstImage = '',
  secondImage = '',
  firstImageClassName,
  secondImageClassname,
  className,
  slideMode = 'hover',
  showHandlebar = true,
  autoplay = false,
  autoplayDuration = 5000,
}: CompareProps) => {
  const [sliderXPercent, setSliderXPercent] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (slideMode === 'drag' && !isDragging) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = (x / rect.width) * 100;
    setSliderXPercent(Math.max(0, Math.min(100, percent)));
  };

  const handleMouseDown = () => {
    if (slideMode === 'drag') {
      setIsDragging(true);
    }
  };

  const handleMouseUp = () => {
    if (slideMode === 'drag') {
      setIsDragging(false);
    }
  };

  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Second Image (Background) */}
      <div className="absolute inset-0">
        <img
          src={secondImage}
          alt="Second"
          className={cn('h-full w-full', secondImageClassname)}
        />
      </div>

      {/* First Image (Overlay with clip) */}
      <div
        className="absolute inset-0"
        style={{
          clipPath: `inset(0 ${100 - sliderXPercent}% 0 0)`,
        }}
      >
        <img
          src={firstImage}
          alt="First"
          className={cn('h-full w-full', firstImageClassName)}
        />
      </div>

      {/* Slider Line */}
      <div
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize"
        style={{
          left: `${sliderXPercent}%`,
        }}
      >
        {/* Handle */}
        {showHandlebar && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-white shadow-lg">
              <svg
                className="h-5 w-5 text-black"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                />
              </svg>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
