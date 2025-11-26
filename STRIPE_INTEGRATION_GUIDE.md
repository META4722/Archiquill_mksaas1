# Stripe 集成指南

## 📦 当前状态

你的项目已经有 Stripe 的代码框架，只需要配置 API 密钥即可使用。

## 🔧 Step 1: 获取 Stripe API 密钥

### 1.1 注册/登录 Stripe
访问 https://stripe.com 并注册或登录账户

### 1.2 获取 API 密钥
1. 进入 Stripe Dashboard: https://dashboard.stripe.com
2. 点击右上角的 "开发者" (Developers)
3. 选择 "API 密钥" (API keys)
4. 你会看到两个密钥：
   - **可发布密钥** (Publishable key) - 以 `pk_` 开头（测试环境是 `pk_test_`）
   - **密钥** (Secret key) - 以 `sk_` 开头（测试环境是 `sk_test_`）

**注意：** 先使用测试环境密钥（test mode）

### 1.3 复制测试环境密钥
```
Publishable key: pk_test_xxxxxxxxxxxxx
Secret key: sk_test_xxxxxxxxxxxxx
```

## 🔧 Step 2: 创建 Stripe 产品和价格

### 2.1 创建产品
1. 在 Stripe Dashboard，点击 "产品" (Products)
2. 点击 "添加产品" (Add product)
3. 填写产品信息：
   - **名称**: Pro 月度订阅
   - **描述**: ArchiQuill 专业版月度订阅
   - **价格**: 99 (CNY 或 USD)
   - **计费周期**: 月度循环
4. 点击保存，复制生成的 **价格 ID**（格式：`price_xxxxx`）

### 2.2 创建所有需要的产品
根据你的定价策略，创建以下产品：

| 产品 | 类型 | 周期 | 价格 ID 变量 |
|------|------|------|-------------|
| Pro 月度 | 订阅 | 月 | `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` |
| Pro 年度 | 订阅 | 年 | `NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY` |
| 终身会员 | 一次性 | - | `NEXT_PUBLIC_STRIPE_PRICE_LIFETIME` |
| 积分包-基础 | 一次性 | - | `NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC` |
| 积分包-标准 | 一次性 | - | `NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD` |
| 积分包-高级 | 一次性 | - | `NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM` |
| 积分包-企业 | 一次性 | - | `NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE` |

## 🔧 Step 3: 配置环境变量

### 3.1 编辑 `.env.local` 文件

将以下内容添加到 `.env.local`（替换为你的实际值）：

```bash
# -----------------------------------------------------------------------------
# Stripe Payment (测试环境)
# https://dashboard.stripe.com/apikeys
# -----------------------------------------------------------------------------
STRIPE_SECRET_KEY="sk_test_你的密钥"
STRIPE_WEBHOOK_SECRET="" # 稍后配置

# Stripe 价格 ID (从 Stripe Dashboard 获取)
# https://dashboard.stripe.com/products
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE="price_xxxxx"
```

### 3.2 重启开发服务器
```bash
# 停止服务器
# 重新启动
pnpm dev
```

## 🔧 Step 4: 配置 Stripe Webhook

### 4.1 使用 Stripe CLI（本地开发，推荐）

**安装 Stripe CLI:**
```bash
# macOS (Homebrew)
brew install stripe/stripe-cli/stripe

# 其他系统参考: https://stripe.com/docs/stripe-cli
```

**登录并转发 Webhook:**
```bash
# 登录 Stripe
stripe login

# 转发 webhook 到本地
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

执行后，会显示你的 webhook 签名密钥：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

复制这个密钥并添加到 `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxxx"
```

### 4.2 使用 ngrok（如果不想用 Stripe CLI）

如果你已经在用 ngrok for Creem，可以复用：

1. **在 Stripe Dashboard 配置 Webhook:**
   - 访问 https://dashboard.stripe.com/webhooks
   - 点击 "添加端点" (Add endpoint)
   - URL: `https://你的ngrok地址/api/stripe/webhook`
   - 选择要监听的事件：
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

2. **获取 Webhook 签名密钥:**
   - 创建后，点击 webhook 端点
   - 复制 "签名密钥" (Signing secret)
   - 添加到 `.env.local`

## 🔧 Step 5: 更新价格配置

编辑 `src/config/website.tsx` 中的价格配置，确保价格 ID 与环境变量匹配。

### 示例配置
```typescript
price: {
  plans: {
    pro: {
      id: 'pro',
      name: 'Pro',
      description: '专业计划',
      prices: [
        {
          id: 'pro-monthly',
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
          type: PaymentTypes.SUBSCRIPTION,
          interval: PlanIntervals.MONTH,
          amount: 9900, // 99 CNY
          currency: 'cny',
        },
        {
          id: 'pro-yearly',
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY!,
          type: PaymentTypes.SUBSCRIPTION,
          interval: PlanIntervals.YEAR,
          amount: 99000, // 990 CNY
          currency: 'cny',
        },
      ],
    },
  },
},
```

## 🧪 Step 6: 测试 Stripe 支付

### 6.1 访问原有的定价页面
```
http://localhost:3000/pricing
```

### 6.2 使用 Stripe 测试卡
Stripe 提供测试卡号用于测试：

| 卡号 | 用途 |
|------|------|
| `4242 4242 4242 4242` | 成功支付 |
| `4000 0000 0000 9995` | 支付失败 |
| `4000 0025 0000 3155` | 需要 3D 验证 |

- **过期日期**: 任何未来日期
- **CVC**: 任何 3 位数字
- **邮编**: 任何 5 位数字

### 6.3 完成支付流程
1. 点击订阅按钮
2. 填写测试卡信息
3. 完成支付
4. 应该重定向回你的应用

### 6.4 验证 Webhook
- 检查 Stripe CLI 或 ngrok 日志
- 查看 Stripe Dashboard 的 Webhook 日志
- 确认订阅已在数据库中创建

## 🎯 Step 7: 实现双支付系统

现在你有两个支付系统，可以选择以下方案：

### 方案 A: 不同页面使用不同支付方式

```
/pricing - Stripe 支付（订阅计划）
/creem-pricing - Creem 支付（订阅计划）
/credits - Stripe 支付（积分包）
```

### 方案 B: 用户选择支付方式

创建一个统一的定价页面，让用户选择支付方式：

```typescript
<div className="flex gap-4 mb-6">
  <Button
    variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
    onClick={() => setPaymentMethod('stripe')}
  >
    Stripe
  </Button>
  <Button
    variant={paymentMethod === 'creem' ? 'default' : 'outline'}
    onClick={() => setPaymentMethod('creem')}
  >
    Creem
  </Button>
</div>

{/* 根据选择的支付方式显示不同按钮 */}
{paymentMethod === 'stripe' ? (
  <CheckoutButton {...stripeProps} />
) : (
  <CreemCheckoutButton {...creemProps} />
)}
```

### 方案 C: 根据地区自动选择

```typescript
const paymentProvider = locale === 'zh' ? 'creem' : 'stripe';
```

## 📊 完整的环境变量清单

```bash
# Creem (订阅管理)
CREEM_API_KEY="creem_test_2JHlABiVe9OvWR2QfRe8vK"
CREEM_WEBHOOK_SECRET="whsec_5FIkvzEIUUpp87ifoKU9tx"

# Stripe (支付处理)
STRIPE_SECRET_KEY="sk_test_xxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM="price_xxxxx"
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE="price_xxxxx"
```

## 🚀 生产环境部署

### Stripe 生产环境配置
1. 切换到 Stripe 生产模式
2. 获取生产环境 API 密钥（以 `sk_live_` 和 `pk_live_` 开头）
3. 在生产服务器配置 Webhook URL
4. 更新 `.env.production` 中的密钥

### Creem 生产环境配置
1. 使用生产 API 密钥：`creem_3wHIJX7X4YERGdJ6oZE9Jd`
2. 配置生产 Webhook URL

## 📞 需要帮助？

遇到问题时的调试步骤：
1. **Stripe 问题**: 查看 Stripe Dashboard 的日志
2. **Webhook 问题**: 使用 Stripe CLI 或查看 ngrok 日志
3. **支付问题**: 检查浏览器控制台和服务器日志

## 🔗 有用的链接

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Stripe 测试卡号](https://stripe.com/docs/testing)
- [Stripe CLI 文档](https://stripe.com/docs/stripe-cli)
- [Stripe API 文档](https://stripe.com/docs/api)
