'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLocaleRouter } from '@/i18n/navigation';
import { Routes } from '@/routes';
import { Gift, Sparkles } from 'lucide-react';

interface SignupPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'soft' | 'hard';
  giftCredits?: number;
}

export function SignupPromptDialog({
  open,
  onOpenChange,
  variant,
  giftCredits = 30,
}: SignupPromptDialogProps) {
  const router = useLocaleRouter();

  const goRegister = () => {
    const callback = typeof window !== 'undefined' ? window.location.pathname : Routes.Root;
    router.push(
      `${Routes.Register}?callbackUrl=${encodeURIComponent(callback)}`
    );
  };

  const goLogin = () => {
    const callback = typeof window !== 'undefined' ? window.location.pathname : Routes.Root;
    router.push(
      `${Routes.Login}?callbackUrl=${encodeURIComponent(callback)}`
    );
  };

  const isHard = variant === 'hard';

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isHard) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className="sm:max-w-[440px]"
        onPointerDownOutside={(e) => {
          if (isHard) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isHard) e.preventDefault();
        }}
      >
        <DialogHeader>
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10">
            {isHard ? (
              <Sparkles className="size-6 text-primary" />
            ) : (
              <Gift className="size-6 text-primary" />
            )}
          </div>
          <DialogTitle className="text-center text-xl">
            {isHard
              ? 'Free trials used up'
              : 'Enjoying the results?'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isHard
              ? `Sign up to get ${giftCredits} free credits and keep generating.`
              : `Sign up now and get ${giftCredits} free credits — that's 3 premium generations on us.`}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:flex-col sm:space-x-0 sm:space-y-2">
          <Button onClick={goRegister} size="lg" className="w-full">
            Sign up — get {giftCredits} free credits
          </Button>
          <Button
            onClick={goLogin}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Already have an account? Log in
          </Button>
          {!isHard && (
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Maybe later
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
