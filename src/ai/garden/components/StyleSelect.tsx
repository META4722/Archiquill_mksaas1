'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { GARDEN_STYLES } from '../lib/garden-styles';

interface StyleSelectProps {
  selectedStyleId: string;
  onStyleChange: (styleId: string) => void;
  disabled?: boolean;
}

export function StyleSelect({
  selectedStyleId,
  onStyleChange,
  disabled,
}: StyleSelectProps) {
  const t = useTranslations('AIGardenPage');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('styleSelect.title')}</Label>
      <RadioGroup
        value={selectedStyleId}
        onValueChange={onStyleChange}
        disabled={disabled}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {GARDEN_STYLES.map((style) => (
          <Label
            key={style.id}
            htmlFor={style.id}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:border-primary',
              selectedStyleId === style.id && 'border-primary bg-primary/5',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem value={style.id} id={style.id} className="mt-1" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {style.icon} {style.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {style.description}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
