# 生产环境部署检查清单

## 🔐 必须配置的 API 和密钥

### 1️⃣ 数据库 (必需)

**Neon PostgreSQL** 或其他 PostgreSQL 提供商

```bash
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"
```

**获取方式**：
- Neon: https://neon.tech (推荐，免费套餐可用)
- Supabase: https://supabase.com
- Railway: https://railway.app
- 或自建 PostgreSQL

---

### 2️⃣ 认证系统 (必需)

#### Better Auth Secret
```bash
BETTER_AUTH_SECRET="生成的随机密钥"
```

**生成命令**：
```bash
openssl rand -base64 32
```

#### 基础 URL
```bash
NEXT_PUBLIC_BASE_URL="https://你的域名.com"
```

---

### 3️⃣ OAuth 社交登录 (可选但推荐)

#### GitHub OAuth
```bash
GITHUB_CLIENT_ID="你的 GitHub Client ID"
GITHUB_CLIENT_SECRET="你的 GitHub Client Secret"
```

**获取步骤**：
1. 访问 https://github.com/settings/developers
2. 点击 "New OAuth App"
3. 填写信息：
   - Application name: 你的应用名称
   - Homepage URL: https://你的域名.com
   - Authorization callback URL: https://你的域名.com/api/auth/callback/github
4. 创建后获取 Client ID 和 Client Secret

#### Google OAuth
```bash
GOOGLE_CLIENT_ID="你的 Google Client ID"
GOOGLE_CLIENT_SECRET="你的 Google Client Secret"
```

**获取步骤**：
1. 访问 https://console.cloud.google.com
2. 创建新项目或选择现有项目
3. 启用 "Google+ API"
4. 创建 OAuth 2.0 凭据
5. 添加授权的重定向 URI：
   - https://你的域名.com/api/auth/callback/google
6. 获取 Client ID 和 Client Secret

---

### 4️⃣ Stripe 支付 (必需 - 用于付费功能)

#### Stripe 生产环境密钥
```bash
# Stripe 密钥 (使用生产密钥，sk_live_ 开头)
STRIPE_SECRET_KEY="sk_live_你的生产密钥"

# Stripe Webhook Secret (从 Stripe Dashboard 获取)
STRIPE_WEBHOOK_SECRET="whsec_你的生产webhook密钥"

# Stripe 价格 ID (生产环境的价格 ID)
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_生产环境BasicID"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_生产环境ProID"
```

**获取步骤**：

##### A. 获取 API 密钥
1. 访问 https://dashboard.stripe.com/apikeys
2. 确保**关闭**"查看测试数据"模式（右上角开关）
3. 复制 "Secret key" (sk_live_ 开头)

##### B. 创建产品和价格
1. 访问 https://dashboard.stripe.com/products
2. 创建产品：
   - **Basic Plan**: $29/月
   - **Pro Plan**: $69/月
3. 记录每个产品的价格 ID (price_xxxxx)

##### C. 配置 Webhook
1. 访问 https://dashboard.stripe.com/webhooks
2. 点击 "添加端点"
3. 填写信息：
   - **端点 URL**: `https://你的域名.com/api/webhooks/stripe`
   - **描述**: Production Webhook
   - **监听事件**:
     - ✅ `checkout.session.completed`
     - ✅ `customer.subscription.created`
     - ✅ `customer.subscription.updated`
     - ✅ `customer.subscription.deleted`
     - ✅ `invoice.paid`
     - ✅ `invoice.payment_failed`
4. 创建后，点击端点查看详情
5. 复制 "签名密钥" (whsec_ 开头)

---

### 5️⃣ 邮件服务 (推荐 - 用于邮件验证和通知)

#### Resend (推荐)
```bash
RESEND_API_KEY="re_你的API密钥"
RESEND_AUDIENCE_ID="你的受众ID"  # 用于 Newsletter
```

**获取步骤**：
1. 访问 https://resend.com
2. 注册账户（免费套餐：每月 3000 封邮件）
3. 获取 API 密钥：
   - 进入 "API Keys" 页面
   - 点击 "Create API Key"
   - 复制密钥
4. （可选）创建受众用于 Newsletter：
   - 进入 "Audiences" 页面
   - 创建新受众
   - 复制受众 ID

**替代方案**：
- SendGrid: https://sendgrid.com
- Mailgun: https://www.mailgun.com
- AWS SES: https://aws.amazon.com/ses

---

### 6️⃣ 文件存储 (必需 - 用于图片上传)

#### Cloudflare R2 (当前使用)
```bash
STORAGE_REGION="auto"
STORAGE_BUCKET_NAME="你的bucket名称"
STORAGE_ACCESS_KEY_ID="你的Access Key ID"
STORAGE_SECRET_ACCESS_KEY="你的Secret Access Key"
STORAGE_ENDPOINT="https://你的accountid.r2.cloudflarestorage.com"
STORAGE_PUBLIC_URL="https://你的自定义域名.com"  # 或 R2 public URL
```

**获取步骤**：
1. 访问 https://dash.cloudflare.com
2. 进入 "R2" 服务
3. 创建存储桶（Bucket）
4. 获取 API 令牌：
   - 点击 "管理 R2 API 令牌"
   - 创建新令牌
   - 复制 Access Key ID 和 Secret Access Key
5. 配置公共访问（可选）：
   - 设置自定义域名或使用 R2 public URL

**替代方案**：
- AWS S3: https://aws.amazon.com/s3
- DigitalOcean Spaces: https://www.digitalocean.com/products/spaces
- Vercel Blob: https://vercel.com/docs/storage/vercel-blob

---

### 7️⃣ AI 服务 (必需 - 用于图片生成)

#### Evolink AI API
```bash
EVOLINK_API_KEY="sk-你的API密钥"
```

**获取方式**：
- 联系 Evolink AI 获取生产环境 API 密钥
- 或使用其他 AI 图片生成服务（需要修改代码）

**替代方案**：
- OpenAI DALL-E: https://platform.openai.com
- Stability AI: https://stability.ai
- Replicate: https://replicate.com
- Midjourney API (第三方)

---

### 8️⃣ 分析工具 (可选但推荐)

#### Google Tag Manager
```bash
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GTM-xxxxxxx"
```

**获取步骤**：
1. 访问 https://tagmanager.google.com
2. 创建新容器
3. 获取容器 ID (GTM-xxxxxx)
4. 添加 Google Analytics 4 标签

---

## 📋 完整的 .env.production 示例

```bash
# -----------------------------------------------------------------------------
# Application
# -----------------------------------------------------------------------------
NEXT_PUBLIC_BASE_URL="https://你的域名.com"

# -----------------------------------------------------------------------------
# Database
# -----------------------------------------------------------------------------
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# -----------------------------------------------------------------------------
# Better Auth
# -----------------------------------------------------------------------------
BETTER_AUTH_SECRET="使用 openssl rand -base64 32 生成"

# -----------------------------------------------------------------------------
# OAuth Providers (可选)
# -----------------------------------------------------------------------------
GITHUB_CLIENT_ID="你的 GitHub Client ID"
GITHUB_CLIENT_SECRET="你的 GitHub Client Secret"
GOOGLE_CLIENT_ID="你的 Google Client ID"
GOOGLE_CLIENT_SECRET="你的 Google Client Secret"

# -----------------------------------------------------------------------------
# Email (推荐)
# -----------------------------------------------------------------------------
RESEND_API_KEY="re_你的API密钥"
RESEND_AUDIENCE_ID="你的受众ID"

# -----------------------------------------------------------------------------
# Stripe Payment (必需)
# -----------------------------------------------------------------------------
STRIPE_SECRET_KEY="sk_live_你的生产密钥"
STRIPE_WEBHOOK_SECRET="whsec_你的生产webhook密钥"

# Stripe 价格 ID
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_生产BasicID"
NEXT_PUBLIC_STRIPE_PRICE_BASIC_YEARLY=""
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_生产ProID"
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=""
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=""

# -----------------------------------------------------------------------------
# Analytics (可选)
# -----------------------------------------------------------------------------
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GTM-xxxxxxx"

# -----------------------------------------------------------------------------
# AI Service (必需)
# -----------------------------------------------------------------------------
EVOLINK_API_KEY="sk-你的生产API密钥"

# -----------------------------------------------------------------------------
# Storage (必需)
# -----------------------------------------------------------------------------
STORAGE_REGION="auto"
STORAGE_BUCKET_NAME="你的bucket名称"
STORAGE_ACCESS_KEY_ID="你的Access Key ID"
STORAGE_SECRET_ACCESS_KEY="你的Secret Access Key"
STORAGE_ENDPOINT="https://你的accountid.r2.cloudflarestorage.com"
STORAGE_PUBLIC_URL="https://你的域名.com"
```

---

## 🚀 部署平台配置

### Vercel (推荐)

1. **连接 GitHub 仓库**
   - 访问 https://vercel.com
   - 导入你的 GitHub 仓库

2. **配置环境变量**
   - 在 Vercel 项目设置中添加所有环境变量
   - Settings → Environment Variables
   - 将上面的变量逐个添加

3. **配置构建设置**
   ```
   Build Command: pnpm build
   Output Directory: .next
   Install Command: pnpm install
   ```

4. **配置自定义域名**
   - Settings → Domains
   - 添加你的域名
   - 按照提示配置 DNS

### 其他平台

- **Railway**: https://railway.app
- **Netlify**: https://netlify.com
- **DigitalOcean App Platform**: https://www.digitalocean.com/products/app-platform
- **AWS Amplify**: https://aws.amazon.com/amplify

---

## ✅ 部署前检查清单

### 必须完成
- [ ] 配置生产数据库 (DATABASE_URL)
- [ ] 生成并配置 BETTER_AUTH_SECRET
- [ ] 配置 NEXT_PUBLIC_BASE_URL (你的域名)
- [ ] 配置 Stripe 生产 API 密钥
- [ ] 创建 Stripe 生产环境产品和价格
- [ ] 配置 Stripe 生产 webhook
- [ ] 配置文件存储 (Cloudflare R2 或 S3)
- [ ] 配置 AI API (Evolink 或替代)

### 强烈推荐
- [ ] 配置邮件服务 (Resend 或 SendGrid)
- [ ] 配置 OAuth 登录 (GitHub 和 Google)
- [ ] 配置分析工具 (Google Tag Manager)
- [ ] 设置自定义域名
- [ ] 配置 SSL 证书 (Vercel 自动配置)

### 部署后验证
- [ ] 测试用户注册和登录
- [ ] 测试邮件发送
- [ ] 测试 OAuth 社交登录
- [ ] 测试 Stripe 支付流程（使用真实测试卡）
- [ ] 测试图片生成功能
- [ ] 测试积分系统
- [ ] 检查所有页面是否正常加载

---

## 🔒 安全建议

1. **绝对不要提交 .env 文件到 Git**
   - .env.local
   - .env.production
   - 已在 .gitignore 中

2. **使用强密钥**
   - BETTER_AUTH_SECRET 至少 32 字符
   - 定期轮换密钥

3. **限制 API 密钥权限**
   - Stripe: 只启用必要的权限
   - Storage: 使用 IAM 角色限制访问

4. **配置 CORS**
   - 限制 API 访问来源

5. **启用速率限制**
   - 防止 API 滥用

---

## 💰 成本估算

| 服务 | 免费额度 | 付费计划 |
|------|---------|---------|
| **Neon (数据库)** | 0.5 GB 存储 | $19/月起 |
| **Vercel (托管)** | 100 GB 带宽/月 | $20/月起 |
| **Resend (邮件)** | 3000 封/月 | $20/月起 |
| **Cloudflare R2** | 10 GB 存储 | $0.015/GB |
| **Stripe** | 无月费 | 2.9% + $0.30/笔 |
| **Evolink AI** | 取决于供应商 | 按使用付费 |

**估算月成本**（小型应用）：
- 免费套餐可以运行：$0 - $20/月
- 中型应用：$50 - $100/月
- 大型应用：$200+/月

---

## 📞 需要帮助？

如果在配置过程中遇到问题：

1. 查看相关文档：
   - [STRIPE_INTEGRATION_GUIDE.md](STRIPE_INTEGRATION_GUIDE.md)
   - [STRIPE_WEBHOOK_SETUP.md](STRIPE_WEBHOOK_SETUP.md)

2. 检查日志：
   - Vercel: https://vercel.com/dashboard → Logs
   - Stripe: https://dashboard.stripe.com/logs

3. 测试 Webhook：
   - 使用 Stripe CLI: `stripe listen --forward-to your-domain.com/api/webhooks/stripe`

---

**最后更新**: 2025-01-25
**维护者**: Claude Code
