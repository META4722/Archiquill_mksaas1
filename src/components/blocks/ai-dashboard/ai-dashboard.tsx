'use client';

import { Routes } from '@/routes';
import { FlowerIcon, TreesIcon } from 'lucide-react';
import { AIToolCard } from './ai-tool-card';
import { CreditBalance } from './credit-balance';

interface AIDashboardProps {
  userCredits: number;
}

const AI_TOOLS = [
  {
    id: 'landscape',
    title: 'AI 景观设计',
    titleEn: 'Landscape Design',
    description: '将草图转换为专业的景观设计渲染图',
    descriptionEn: 'Transform sketches into professional landscape renderings',
    icon: <TreesIcon className="size-6" />,
    href: Routes.AILandscape,
    credits: 5,
    comingSoon: false,
  },
  {
    id: 'garden',
    title: 'AI 花园设计',
    titleEn: 'Garden Design',
    description: '生成多种风格的精美花园设计方案',
    descriptionEn: 'Generate beautiful garden designs in various styles',
    icon: <FlowerIcon className="size-6" />,
    href: Routes.AIGarden,
    credits: 5,
    comingSoon: false,
  },
] as const;

export function AIDashboard({ userCredits }: AIDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Credits Section */}
      <CreditBalance credits={userCredits} />

      {/* AI Tools Grid */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">🎨 AI 设计工具</h2>
          <p className="text-muted-foreground">
            选择一个 AI 工具开始你的创作之旅
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {AI_TOOLS.map((tool) => (
            <AIToolCard
              key={tool.id}
              title={tool.title}
              description={tool.description}
              icon={tool.icon}
              href={tool.href}
              credits={tool.credits}
              comingSoon={tool.comingSoon}
            />
          ))}

          {/* Coming Soon Placeholders */}
          <AIToolCard
            title="更多 AI 工具"
            description="敬请期待更多精彩的 AI 设计功能"
            icon="✨"
            credits={5}
            comingSoon
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">本月生成</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">积分消耗</p>
          <p className="text-2xl font-bold">-</p>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-sm text-muted-foreground">收藏作品</p>
          <p className="text-2xl font-bold">-</p>
        </div>
      </div>
    </div>
  );
}
