'use client';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCwIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
  suggestions?: string[];
  onRefreshSuggestions?: () => void;
  mode?: 'image_to_image' | 'text_to_image';
}

export function PromptInput({
  onSubmit,
  disabled,
  suggestions = [],
  onRefreshSuggestions,
  mode = 'image_to_image',
}: PromptInputProps) {
  const t = useTranslations('AILandscapePage.prompt');
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onSubmit(prompt.trim());
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, new line on Shift+Enter
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim()) {
        onSubmit(prompt.trim());
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="prompt">{t('label')}</Label>
        <Textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          disabled={disabled}
          className="min-h-[100px] resize-none"
        />
        <p className="text-xs text-muted-foreground">{t('hint')}</p>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t('suggestions.title')}</Label>
            {onRefreshSuggestions && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRefreshSuggestions}
                disabled={disabled}
              >
                <RefreshCwIcon className="mr-1 size-3" />
                {t('suggestions.refresh')}
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                disabled={disabled}
                className="h-auto whitespace-normal py-2 text-left text-xs"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={disabled || !prompt.trim()}
        className="w-full"
      >
        {disabled
          ? t('generating')
          : mode === 'text_to_image'
            ? `${t('submit')} (Free)`
            : `${t('submit')} (5 Credits)`
        }
      </Button>
    </form>
  );
}
