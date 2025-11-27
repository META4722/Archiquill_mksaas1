# 图片优化指南

## 问题识别

根据性能报告，网站加载了 **6,413 KiB** 的图片资源，主要问题：

### 最大的图片文件

| 文件名 | 大小 | 位置 |
|--------|------|------|
| Archi_Render_Flux_Max.png | 1.7 MB | public/images/archi/ |
| Archi_Sketch_Flux_Pro.png | 1.3 MB | public/images/archi/ |
| design-freedom-sketch.jpg | 658 KB | public/images/archi/ |
| quick-idea-sketch.jpeg | 498 KB | public/images/archi/ |
| sketch-styles.jpeg | 732 KB | public/images/archi/ |

### 外部 CDN 图片
来自 `img.archiquill.com` 的图片也需要优化。

---

## 解决方案

### 1. 使用 OptimizedImage 组件

已创建优化的图片组件：[src/components/ui/optimized-image.tsx](src/components/ui/optimized-image.tsx)

```tsx
import { OptimizedImage, HeroImage, ThumbnailImage } from '@/components/ui/optimized-image';

// 普通图片 (85% 质量, 懒加载)
<OptimizedImage
  src="/images/archi/design-freedom-sketch.jpg"
  alt="设计自由"
  width={1200}
  height={800}
/>

// Hero 区域图片 (90% 质量, 优先加载)
<HeroImage
  src="/images/archi/Archi_Render_Flux_Max.png"
  alt="建筑渲染"
  width={1920}
  height={1080}
/>

// 缩略图 (75% 质量, 懒加载)
<ThumbnailImage
  src="/images/archi/quick-idea-render.jpg"
  alt="快速创意"
  width={400}
  height={300}
/>
```

### 2. 图片格式优化

Next.js 会自动将图片转换为：
1. **AVIF** (最优先) - 比 JPEG 小 50%+
2. **WebP** (fallback) - 比 JPEG 小 25-35%
3. **原格式** (最后的 fallback)

### 3. 响应式尺寸

使用 `sizes` 属性告诉浏览器按需加载：

```tsx
<OptimizedImage
  src="/images/large-image.jpg"
  alt="大图"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
/>
```

这意味着：
- 移动设备 (≤768px): 加载 100vw 宽度
- 平板 (≤1200px): 加载 80vw 宽度
- 桌面: 加载最大 1200px

### 4. 优先级控制

```tsx
// 首屏图片 - 立即加载
<OptimizedImage priority src="..." alt="..." width={...} height={...} />

// 折叠下方图片 - 懒加载 (默认)
<OptimizedImage src="..." alt="..." width={...} height={...} />
```

---

## 立即行动项

### 步骤 1: 搜索并替换所有 `<img>` 标签

```bash
# 搜索所有使用 <img> 的文件
grep -r "<img" src/components src/app --include="*.tsx" --include="*.jsx"
```

### 步骤 2: 替换为 OptimizedImage

**Before:**
```tsx
<img src="/images/archi/design-freedom-sketch.jpg" alt="设计自由" />
```

**After:**
```tsx
import { OptimizedImage } from '@/components/ui/optimized-image';

<OptimizedImage
  src="/images/archi/design-freedom-sketch.jpg"
  alt="设计自由"
  width={1200}
  height={800}
  sizes="(max-width: 768px) 100vw, 1200px"
/>
```

### 步骤 3: CDN 图片优化

对于 `img.archiquill.com` 的图片：

```tsx
<OptimizedImage
  src="https://img.archiquill.com/archi/Archi_Render_Flux_Max.png"
  alt="渲染效果"
  width={1920}
  height={1080}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
/>
```

Next.js 会通过 Image Optimization API 优化这些外部图片。

### 步骤 4: 压缩本地图片

对于 public/images/archi/ 中的大图片：

#### 方法 A: 使用在线工具
1. [TinyPNG](https://tinypng.com/) - JPEG/PNG 压缩
2. [Squoosh](https://squoosh.app/) - 多格式转换和压缩
3. [ImageOptim](https://imageoptim.com/mac) - Mac 应用

#### 方法 B: 命令行工具

**安装 ImageMagick:**
```bash
brew install imagemagick
```

**批量优化 JPEG (85% 质量):**
```bash
cd public/images/archi
for file in *.jpg *.jpeg; do
  convert "$file" -quality 85 -resize '1920x1920>' "optimized_$file"
done
```

**批量优化 PNG:**
```bash
for file in *.png; do
  convert "$file" -quality 85 -resize '1920x1920>' "optimized_$file"
done
```

**转换为 WebP:**
```bash
for file in *.jpg *.jpeg *.png; do
  cwebp -q 85 "$file" -o "${file%.*}.webp"
done
```

---

## 预期效果

### 优化前
- Archi_Render_Flux_Max.png: 1.7 MB
- Archi_Sketch_Flux_Pro.png: 1.3 MB
- design-freedom-sketch.jpg: 658 KB
- **总计:** 约 3.7 MB (仅这 3 张图)

### 优化后 (使用 AVIF + Next.js Image)
- Archi_Render_Flux_Max.avif: ~400-500 KB (70% 减少)
- Archi_Sketch_Flux_Pro.avif: ~300-400 KB (70% 减少)
- design-freedom-sketch.avif: ~150-200 KB (70% 减少)
- **总计:** 约 850-1,100 KB

**节省: 约 2.6-2.9 MB (70%+ 减少)**

---

## Next.js Image 配置

已在 [next.config.ts](next.config.ts) 中配置：

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year cache
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'img.archiquill.com',
    },
    // ... other domains
  ],
}
```

---

## 最佳实践

### 1. 始终指定宽度和高度
```tsx
// ✅ Good
<OptimizedImage src="..." alt="..." width={1200} height={800} />

// ❌ Bad (会导致布局偏移)
<OptimizedImage src="..." alt="..." />
```

### 2. 使用正确的 sizes 属性
```tsx
// Hero 图片
sizes="100vw"

// 内容图片
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"

// 缩略图
sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
```

### 3. 优先级管理
- 首屏可见: `priority={true}`
- 折叠下方: `priority={false}` (默认)

### 4. 图片质量
- Hero 图片: 90%
- 普通图片: 85%
- 缩略图: 75%

---

## 监控和测试

### 测试工具
```bash
# 1. 本地构建
pnpm build

# 2. 启动生产服务器
pnpm start

# 3. 使用 Lighthouse 测试
npx lighthouse http://localhost:3000 --view

# 4. 检查网络请求
# 打开 Chrome DevTools -> Network -> Img 过滤器
```

### 检查清单
- [ ] 所有大图片 (>100KB) 使用 OptimizedImage
- [ ] 首屏图片设置 priority={true}
- [ ] 所有图片指定了 width 和 height
- [ ] 使用了合适的 sizes 属性
- [ ] CDN 图片在 remotePatterns 中配置
- [ ] 压缩了 public 目录中的源文件

---

## 额外优化

### 1. 使用占位符
```tsx
// Blur 占位符 (需要 blurDataURL)
<OptimizedImage
  src="..."
  alt="..."
  width={1200}
  height={800}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>

// 空占位符
<OptimizedImage
  src="..."
  alt="..."
  width={1200}
  height={800}
  placeholder="empty"
/>
```

### 2. 生成 blurDataURL

使用 [Plaiceholder](https://plaiceholder.co/) 或在线工具生成。

### 3. SVG 优化

对于图标和矢量图，使用 SVG：
```tsx
import Image from 'next/image';
import logo from '@/public/logo.svg';

<Image src={logo} alt="Logo" />
```

---

## 常见问题

### Q: 为什么图片还是很大？
A: 确保：
1. 使用了 `next/image` 组件
2. 没有设置 `unoptimized={true}`
3. 在生产环境测试 (pnpm build && pnpm start)

### Q: 外部图片无法加载？
A: 检查 `next.config.ts` 中的 `remotePatterns` 配置。

### Q: 如何禁用图片优化？
A: 设置环境变量：
```env
DISABLE_IMAGE_OPTIMIZATION=true
```

### Q: Vercel 免费额度用完了？
A: Vercel 免费计划每月优化 1000 张图片。考虑：
1. 升级到 Pro 计划
2. 使用 Cloudflare Images 或其他 CDN
3. 预先优化图片

---

## 部署后验证

1. 访问网站并打开 Chrome DevTools
2. Network 标签 -> Img 过滤器
3. 检查：
   - 图片格式是否为 AVIF/WebP
   - 图片大小是否明显减少
   - Cache-Control 头是否设置正确

---

## 参考资料

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Web.dev Image Optimization](https://web.dev/fast/#optimize-your-images)
- [Can I Use WebP](https://caniuse.com/webp)
- [Can I Use AVIF](https://caniuse.com/avif)
