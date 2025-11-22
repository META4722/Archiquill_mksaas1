'use client';

import { cn } from '@/lib/utils';
import { Building2, Flower, HomeIcon, TreesIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export type ToolType = 'exterior' | 'interior' | 'landscape' | 'garden';

interface Tool {
  id: ToolType;
  icon: React.ReactNode;
  labelKey: string;
}

interface ToolGridSelectorProps {
  selectedTool: ToolType | null;
  onToolSelect: (tool: ToolType) => void;
  disabled?: boolean;
}

export function ToolGridSelector({
  selectedTool,
  onToolSelect,
  disabled = false,
}: ToolGridSelectorProps) {
  const t = useTranslations('Dashboard.home.unifiedGeneration.toolGrid');

  const tools: Tool[] = [
    {
      id: 'exterior',
      icon: <HomeIcon className="size-7" />,
      labelKey: 'exterior',
    },
    {
      id: 'interior',
      icon: <Building2 className="size-7" />,
      labelKey: 'interior',
    },
    {
      id: 'landscape',
      icon: <TreesIcon className="size-7" />,
      labelKey: 'landscape',
    },
    {
      id: 'garden',
      icon: <Flower className="size-7" />,
      labelKey: 'garden',
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tools.map((tool) => {
          const isSelected = selectedTool === tool.id;
          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolSelect(tool.id)}
              disabled={disabled}
              className={cn(
                'group flex flex-col items-center gap-2 rounded-lg border p-4 transition-all',
                'hover:border-primary/50 hover:shadow-md',
                isSelected &&
                  'border-primary bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg',
                !isSelected && 'bg-card hover:bg-accent',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <div
                className={cn(
                  'flex size-14 items-center justify-center rounded-lg transition-colors',
                  isSelected
                    ? 'bg-white/20'
                    : 'bg-primary/10 text-primary group-hover:bg-primary/20'
                )}
              >
                {tool.icon}
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isSelected ? 'text-white' : 'text-foreground'
                )}
              >
                {t(tool.labelKey as any)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
