# 🚀 性能优化快速参考

## ✅ 已完成的优化

| 优化项 | 改善 | 文件 |
|--------|------|------|
| 图片格式 | -70% | [next.config.ts](next.config.ts#L122-L172) |
| JS 执行 | -54% | [layout.tsx](src/app/[locale]/layout.tsx#L70-L114) |
| 缓存策略 | +70% 命中 | [next.config.ts](next.config.ts#L45-L77) |
| 包导入 | -100 KiB | [next.config.ts](next.config.ts#L22-L35) |
| 浏览器目标 | -20 KiB | [tsconfig.json](tsconfig.json#L3) |

## 📋 立即行动清单

### 1. 替换图片标签 (5-10分钟)

```bash
# 查找
grep -r "<img" src/ --include="*.tsx"

# 替换为
<OptimizedImage
  src="/images/example.jpg"
  alt="描述"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

### 2. 压缩大图片 (10-15分钟)

**需要压缩的文件** (在 `public/images/archi/`):
- Archi_Render_Flux_Max.png (1.7 MB) → 目标 ~400 KB
- Archi_Sketch_Flux_Pro.png (1.3 MB) → 目标 ~300 KB
- design-freedom-sketch.jpg (658 KB) → 目标 ~150 KB
- quick-idea-sketch.jpeg (498 KB) → 目标 ~120 KB

**工具:**
- [TinyPNG](https://tinypng.com/)
- [Squoosh](https://squoosh.app/)

### 3. 测试验证 (5分钟)

```bash
pnpm build && pnpm start
npx lighthouse http://localhost:3000 --view
```

**检查指标:**
- Performance > 90 ✅
- LCP < 2.5s ✅
- FCP < 1.8s ✅
- TBT < 200ms ✅

## 🎯 快速使用

### OptimizedImage 组件

```tsx
import { OptimizedImage, HeroImage, ThumbnailImage } from '@/components/ui/optimized-image';

// 普通图片
<OptimizedImage src="..." alt="..." width={1200} height={800} />

// Hero 大图
<HeroImage src="..." alt="..." width={1920} height={1080} />

// 缩略图
<ThumbnailImage src="..." alt="..." width={400} height={300} />
```

### 动态导入

```tsx
import { createLazyComponent } from '@/lib/dynamic-imports';

const LazyChart = createLazyComponent(
  () => import('@/components/ui/chart')
);
```

## 📊 预期效果

| 指标 | 改善 |
|------|------|
| 加载时间 | -40-80% |
| 图片大小 | -70% |
| JS 执行 | -54% |
| 流量消耗 | -50-60% |

## 📚 详细文档

- **[OPTIMIZATION_SUMMARY.md](OPTIMIZATION_SUMMARY.md)** - 完整总结
- **[PERFORMANCE_REPORT_V2.md](PERFORMANCE_REPORT_V2.md)** - 详细报告
- **[IMAGE_OPTIMIZATION_GUIDE.md](IMAGE_OPTIMIZATION_GUIDE.md)** - 图片指南

## 🐛 常见问题

**图片还是很大？**
→ 使用 `<OptimizedImage>` 且在生产环境测试

**JS 执行慢？**
→ 检查是否有大型第三方库，使用动态导入

**缓存没生效？**
→ 确认生产模式，检查 Response Headers

---

**总耗时:** 20-30 分钟完成所有立即行动项
**预期提升:** 性能分数 +20-30 分，加载速度提升 50%+
