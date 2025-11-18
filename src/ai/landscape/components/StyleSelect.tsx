'use client';

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { RENDERING_STYLES, type RenderingStyle } from '../lib/landscape-types';

interface StyleSelectProps {
  selectedStyle: RenderingStyle;
  onStyleChange: (style: RenderingStyle) => void;
  disabled?: boolean;
}

export function StyleSelect({
  selectedStyle,
  onStyleChange,
  disabled,
}: StyleSelectProps) {
  const t = useTranslations('AILandscapePage.styles');

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{t('title')}</Label>
      <RadioGroup
        value={selectedStyle}
        onValueChange={(value) => onStyleChange(value as RenderingStyle)}
        disabled={disabled}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {RENDERING_STYLES.map(({ value, labelKey, descriptionKey }) => (
          <Label
            key={value}
            htmlFor={value}
            className={cn(
              'flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors hover:border-primary',
              selectedStyle === value && 'border-primary bg-primary/5',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            <RadioGroupItem value={value} id={value} className="mt-1" />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                {t(labelKey as any)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(descriptionKey as any)}
              </p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </div>
  );
}
