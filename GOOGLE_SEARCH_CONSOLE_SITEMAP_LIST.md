# Google Search Console - Sitemap URL List

**生成日期**: 2025-11-27
**域名**: https://archiquill.com
**语言**: English (en), 中文 (zh)

---

## 📋 提交到 Google Search Console 的 URL

### 主 Sitemap
```
https://archiquill.com/sitemap.xml
```

---

## 📊 Sitemap 包含的完整 URL 列表

### 1️⃣ 主要页面 (Main Pages)

#### 英文版
```
https://archiquill.com/
https://archiquill.com/pricing
https://archiquill.com/about
https://archiquill.com/contact
```

#### 中文版
```
https://archiquill.com/zh/
https://archiquill.com/zh/pricing
https://archiquill.com/zh/about
https://archiquill.com/zh/contact
```

---

### 2️⃣ 认证页面 (Authentication Pages)

#### 英文版
```
https://archiquill.com/auth/login
https://archiquill.com/auth/register
```

#### 中文版
```
https://archiquill.com/zh/auth/login
https://archiquill.com/zh/auth/register
```

---

### 3️⃣ AI 功能页面 (AI Features)

#### 英文版
```
https://archiquill.com/ai-landscape-design
https://archiquill.com/ai-garden-design
```

#### 中文版
```
https://archiquill.com/zh/ai-landscape-design
https://archiquill.com/zh/ai-garden-design
```

---

### 4️⃣ 博客页面 (Blog)

#### 博客首页
```
https://archiquill.com/blog
https://archiquill.com/zh/blog
```

#### 博客文章
```
https://archiquill.com/blog/welcome-to-archiquill
https://archiquill.com/zh/blog/welcome-to-archiquill
```

#### 博客分类页面 (Categories)
```
https://archiquill.com/blog/category/announcement
https://archiquill.com/zh/blog/category/announcement
```

---

## 📈 统计信息

| 类别 | 英文页面 | 中文页面 | 总计 |
|------|---------|---------|------|
| 主要页面 | 4 | 4 | 8 |
| 认证页面 | 2 | 2 | 4 |
| AI 功能 | 2 | 2 | 4 |
| 博客首页 | 1 | 1 | 2 |
| 博客文章 | 1 | 1 | 2 |
| 博客分类 | 1 | 1 | 2 |
| **总计** | **11** | **11** | **22** |

---

## 🔍 SEO 特性

### Canonical 标签
每个页面都包含指向当前语言版本的 canonical 标签：
- 英文页面: `<link rel="canonical" href="https://archiquill.com/pricing" />`
- 中文页面: `<link rel="canonical" href="https://archiquill.com/zh/pricing" />`

### Hreflang 标签
所有页面都包含完整的语言替代标签：
```html
<link rel="alternate" hreflang="en" href="https://archiquill.com/pricing" />
<link rel="alternate" hreflang="zh-CN" href="https://archiquill.com/zh/pricing" />
<link rel="alternate" hreflang="x-default" href="https://archiquill.com/pricing" />
```

---

## 🚀 提交步骤

### 在 Google Search Console 中提交：

1. **登录 Google Search Console**
   - 访问: https://search.google.com/search-console

2. **选择资源**
   - 选择 `archiquill.com`

3. **提交 Sitemap**
   - 左侧菜单 → "索引" → "站点地图"
   - 添加新的站点地图: `sitemap.xml`
   - 点击"提交"

4. **验证提交**
   - 等待 Google 抓取（通常几分钟到几小时）
   - 检查"已发现的 URL" 数量
   - 预期: 约 22+ 个 URL

---

## 📝 注意事项

1. **环境变量**: 确保生产环境设置了正确的 BASE_URL
   ```bash
   NEXT_PUBLIC_BASE_URL="https://archiquill.com"
   ```

2. **URL 结构**:
   - 英文（默认）: 无语言前缀
   - 中文: 使用 `/zh` 前缀

3. **动态更新**:
   - 当添加新博客文章时，sitemap 会自动更新
   - 建议每次发布新内容后，在 Google Search Console 重新提交 sitemap

4. **Robots.txt**:
   - 确保 `robots.txt` 允许 Googlebot 访问
   - 包含 sitemap 引用

---

## 🔗 相关链接

- Sitemap URL: `https://archiquill.com/sitemap.xml`
- Robots.txt: `https://archiquill.com/robots.txt`
- Google Search Console: https://search.google.com/search-console

---

## 📧 后续维护

- **添加新页面**: 更新 `src/app/sitemap.ts` 中的 `staticRoutes` 数组
- **添加博客文章**: 自动包含在 sitemap 中
- **检查频率**: 建议每月检查一次 Google Search Console 的索引状态
