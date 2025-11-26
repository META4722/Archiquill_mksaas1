'use client';

import { useCreditBalance } from '@/hooks/use-credits';
import { Loader2Icon } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Credit refresh indicator
 * Shows when credits are being refreshed in the background
 */
export function CreditRefreshIndicator() {
  const { isFetching } = useCreditBalance({ refetchInterval: 3000 });
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    if (isFetching) {
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isFetching]);

  if (!showIndicator) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md shadow-lg">
        <Loader2Icon className="h-4 w-4 animate-spin" />
        <span className="text-sm">更新积分...</span>
      </div>
    </div>
  );
}
