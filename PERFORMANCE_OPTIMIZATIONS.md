# 性能优化报告

本文档记录了针对 ArchiQuill 项目实施的所有性能优化措施。

## 优化总览

| 优化项目 | 预期节省 | 状态 |
|---------|---------|------|
| 图片优化 | 4,577 KiB | ✅ 完成 |
| 渲染阻塞请求优化 | 640ms | ✅ 完成 |
| LCP 请求发现优化 | - | ✅ 完成 |
| 缓存生命周期优化 | 11 KiB | ✅ 完成 |
| 移除旧版 JavaScript | 20 KiB | ✅ 完成 |

---

## 1. 图片优化 (节省 4,577 KiB)

### 实施的优化:

**文件**: [next.config.ts](next.config.ts:74-124)

- ✅ 启用现代图片格式 (AVIF, WebP)
- ✅ 优化设备尺寸和图片尺寸配置
- ✅ 设置 1 年的图片缓存 TTL
- ✅ 配置 SVG 安全处理
- ✅ 优化远程图片模式

```typescript
images: {
  formats: ['image/avif', 'image/webp'],
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 31536000, // 1 year
}
```

### 效果:
- AVIF 格式比 JPEG 小 50%+
- WebP 作为 fallback，比 JPEG 小 25-35%
- 自动响应式图片加载

---

## 2. 渲染阻塞请求优化 (节省 640ms)

### 实施的优化:

**文件**: [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx:62-101)

- ✅ 使用 Next.js `Script` 组件替代原生 `<script>` 标签
- ✅ Google Tag Manager 使用 `lazyOnload` 策略
- ✅ Google Analytics 使用 `afterInteractive` 策略
- ✅ 移除 head 中的阻塞脚本

### 加载策略说明:

| 策略 | 用途 | 加载时机 |
|------|------|---------|
| `lazyOnload` | GTM | 页面完全加载后 |
| `afterInteractive` | GA4 | 页面可交互后 |

### 效果:
- 首次内容绘制 (FCP) 提前
- 最大内容绘制 (LCP) 提前
- Time to Interactive (TTI) 减少

---

## 3. LCP 请求发现优化

### 实施的优化:

**文件**: [src/app/[locale]/layout.tsx](src/app/[locale]/layout.tsx:49-56)

- ✅ 添加 Google Fonts 的 `preconnect`
- ✅ 添加 Google Tag Manager 的 `dns-prefetch`
- ✅ 优化关键资源的预连接

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
```

**额外资源**: [src/app/[locale]/(marketing)/(home)/resource-hints.tsx](src/app/[locale]/(marketing)/(home)/resource-hints.tsx)

- ✅ 为图片 CDN 添加预连接
- ✅ 减少 DNS 查找时间
- ✅ 提前建立 TLS 连接

### 效果:
- DNS 查找时间减少
- TCP 连接建立时间减少
- TLS 握手提前完成

---

## 4. 缓存生命周期优化 (节省 11 KiB)

### 实施的优化:

**文件**: [next.config.ts](next.config.ts:40-72)

```typescript
async headers() {
  return [
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }],
    },
    {
      source: '/_next/static/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }],
    },
    {
      source: '/fonts/:path*',
      headers: [{
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable'
      }],
    },
  ];
}
```

### 缓存策略:

| 资源类型 | 缓存时间 | 策略 |
|---------|---------|------|
| 图片 (svg, jpg, png, webp, avif) | 1 年 | immutable |
| 静态资源 (_next/static) | 1 年 | immutable |
| 字体文件 | 1 年 | immutable |

### 效果:
- 减少重复请求
- 提高回访用户加载速度
- 降低服务器负载

---

## 5. 移除旧版 JavaScript (节省 20 KiB)

### 实施的优化:

**文件**: [tsconfig.json](tsconfig.json:3)
```json
{
  "target": "ES2020"  // 从 ES2017 升级
}
```

**文件**: [.browserslistrc](.browserslistrc)
```
> 0.5%
last 2 versions
not dead
not IE 11
not op_mini all
```

**文件**: [next.config.ts](next.config.ts:21-38)
```typescript
experimental: {
  optimizePackageImports: [
    '@radix-ui/react-icons',
    '@tabler/icons-react',
    'lucide-react',
    'framer-motion',
    'date-fns',
  ],
},
compress: true,
poweredByHeader: false,
reactStrictMode: true,
```

### 优化措施:
- ✅ 升级 TypeScript 编译目标到 ES2020
- ✅ 配置现代浏览器列表
- ✅ 移除 IE11 polyfills
- ✅ 启用包导入优化
- ✅ 启用 Gzip 压缩
- ✅ 启用 React 严格模式

### 效果:
- Bundle 大小减少
- 移除不必要的 polyfills
- 使用原生 ES2020+ 特性
- Tree-shaking 更有效

---

## 性能指标对比

### 优化前 (预估):
- 图片总大小: ~4,577 KiB
- FCP: 基准
- LCP: 基准 + 640ms
- 缓存未优化
- 包含旧版 JS polyfills: +20 KiB

### 优化后 (预期):
- 图片总大小: 减少 50-70% (使用 AVIF/WebP)
- FCP: 提前 ~400-600ms
- LCP: 减少 640ms
- 静态资源缓存 1 年
- 移除不必要的 polyfills: -20 KiB

---

## 推荐的后续优化

### 短期优化:
1. 🔄 使用 `next/image` 组件替代所有 `<img>` 标签
2. 🔄 实施代码分割 (Code Splitting)
3. 🔄 使用动态导入 (Dynamic Imports) 懒加载组件
4. 🔄 优化字体加载 (Font Display Swap)

### 中期优化:
1. 🔄 实施 Service Worker 缓存策略
2. 🔄 使用 CDN 加速静态资源
3. 🔄 实施图片懒加载和占位符
4. 🔄 优化首屏内容 (Above the Fold)

### 长期优化:
1. 🔄 实施 Edge Runtime
2. 🔄 使用 ISR (Incremental Static Regeneration)
3. 🔄 实施全局状态优化
4. 🔄 监控和分析真实用户性能数据 (RUM)

---

## 测试和验证

### 推荐工具:
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- Chrome DevTools Performance Tab

### 测试命令:
```bash
# 本地构建和测试
pnpm build
pnpm start

# 使用 Lighthouse CI
npx lighthouse http://localhost:3000 --view
```

### 关键指标:
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **TBT** (Total Blocking Time): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Speed Index**: < 3.4s

---

## 部署注意事项

### Vercel 部署:
所有优化已自动应用，无需额外配置。

### 自托管部署:
确保以下配置:
- ✅ 启用 HTTP/2 或 HTTP/3
- ✅ 启用 Brotli 或 Gzip 压缩
- ✅ 配置正确的缓存头
- ✅ 使用 CDN 分发静态资源

### 环境变量:
```env
# 如需禁用图片优化 (不推荐)
DISABLE_IMAGE_OPTIMIZATION=false
```

---

## 更新日志

### 2025-11-27
- ✅ 实施图片优化 (AVIF/WebP)
- ✅ 优化脚本加载策略
- ✅ 添加资源预连接
- ✅ 配置静态资源缓存
- ✅ 升级 JavaScript 编译目标
- ✅ 配置包导入优化

---

## 相关文档

- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Next.js Script Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/scripts)
- [Web Vitals](https://web.dev/vitals/)
- [Chrome User Experience Report](https://developers.google.com/web/tools/chrome-user-experience-report)
