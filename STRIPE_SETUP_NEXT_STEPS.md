# Stripe 配置后续步骤

## ✅ 已完成

1. ✅ Stripe API 密钥已添加到 `.env.local`
2. ✅ 创建了获取价格 ID 的脚本
3. ✅ 系统已支持订阅后自动增加积分

## 🎯 接下来你需要做的 3 件事

### 1️⃣ 获取 Stripe 价格 ID（最重要！）

你给的是**产品 ID**（`prod_`开头），但我们需要**价格 ID**（`price_`开头）。

#### 方法 A: 使用我创建的脚本（推荐）

```bash
# 运行脚本获取所有价格 ID
node scripts/get-stripe-prices.js
```

这个脚本会列出所有产品和对应的价格 ID，格式如下：
```
产品名称: Pro
产品 ID: prod_TUAm1ZHRwCDRsu
价格信息:
  ├─ 价格 ID: price_1xxxxx
  ├─ 金额: 99.00 CNY / month
  └─ 状态: ✅ 激活
```

#### 方法 B: 在 Stripe Dashboard 手动查找

1. 访问 https://dashboard.stripe.com/products
2. 点击你的产品（Basic 或 Pro）
3. 在产品详情页的 "定价" 部分
4. 复制每个价格旁边的 ID（`price_xxxxx` 格式）

#### 获取价格 ID 后

更新 `.env.local` 文件：
```bash
# 替换为你获取的实际价格 ID
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="price_你的BasicID"
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_你的ProID"
```

### 2️⃣ 配置价格计划和积分

编辑 `src/config/website.tsx` 的价格配置：

```typescript
price: {
  plans: {
    // Basic 计划
    basic: {
      id: 'basic',
      name: 'Basic',
      description: '基础计划',
      popular: false,
      prices: [
        {
          id: 'basic-monthly',
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY!,
          type: PaymentTypes.SUBSCRIPTION,
          interval: PlanIntervals.MONTH,
          amount: 4900, // 49 CNY (金额以分为单位)
          currency: 'cny',
        },
      ],
      // 配置订阅后增加的积分
      credits: {
        enable: true,
        amount: 3500, // Basic订阅后增加3500积分
        expireDays: 30, // 积分30天后过期
      },
      features: [
        '每月3500积分',
        '标准渲染速度',
        '基础风格选项',
      ],
    },
    // Pro 计划
    pro: {
      id: 'pro',
      name: 'Pro',
      description: '专业计划',
      popular: true,
      prices: [
        {
          id: 'pro-monthly',
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY!,
          type: PaymentTypes.SUBSCRIPTION,
          interval: PlanIntervals.MONTH,
          amount: 9900, // 99 CNY
          currency: 'cny',
        },
      ],
      // 配置订阅后增加的积分
      credits: {
        enable: true,
        amount: 10000, // Pro订阅后增加10000积分
        expireDays: 30,
      },
      features: [
        '每月10000积分',
        '高优先级处理',
        '高级风格选项',
        '导出高分辨率图像',
      ],
    },
  },
},
```

### 3️⃣ 配置 Stripe Webhook

#### 方法 A: 使用 Stripe CLI（本地开发，推荐）

```bash
# 如果还没安装
brew install stripe/stripe-cli/stripe

# 登录
stripe login

# 监听 webhook（保持运行）
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

会显示：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

复制 `whsec_` 开头的密钥，更新 `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_你的密钥"
```

#### 方法 B: 使用现有的 ngrok

如果你的 ngrok 还在运行（用于 Creem），可以复用：

1. 获取 ngrok URL
2. 在 Stripe Dashboard 配置 Webhook:
   - URL: `https://你的ngrok地址/api/webhooks/stripe`
   - 选择事件:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
3. 获取 Webhook 签名密钥并添加到 `.env.local`

## 🧪 测试流程

### 1. 重启开发服务器
```bash
# 停止服务器
# 重新启动
pnpm dev
```

### 2. 访问定价页面
```
http://localhost:3000/pricing
```

### 3. 测试支付
- 登录你的账户
- 选择一个计划（建议选 Basic 测试）
- 点击订阅按钮
- 使用 Stripe 测试卡: `4242 4242 4242 4242`
- 完成支付

### 4. 验证积分
支付成功后，检查用户的积分余额应该增加了：
- Basic: +3500 积分
- Pro: +10000 积分

## 📊 Stripe 测试卡号

| 卡号 | 用途 |
|------|------|
| `4242 4242 4242 4242` | 成功支付 |
| `4000 0000 0000 9995` | 支付失败 |
| `4000 0025 0000 3155` | 需要 3D 验证 |

- **过期日期**: 任何未来日期（如 12/34）
- **CVC**: 任何 3 位数字（如 123）
- **邮编**: 任何 5 位数字（如 12345）

## 🔍 调试技巧

### 查看 Webhook 日志

**使用 Stripe CLI:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
所有 webhook 事件会在终端显示

**使用 Stripe Dashboard:**
访问 https://dashboard.stripe.com/webhooks 查看webhook日志

### 查看积分是否添加

在浏览器控制台或服务器日志中查找：
```
addSubscriptionCredits, 3500 credits for user xxxxx
或
addSubscriptionCredits, 10000 credits for user xxxxx
```

### 常见问题

**问题 1: 点击按钮后没反应**
- 检查 `.env.local` 中的价格 ID 是否正确
- 确认价格 ID 是 `price_` 开头，不是 `prod_` 开头
- 重启开发服务器

**问题 2: 支付成功但没有积分**
- 检查 Webhook 是否正常接收
- 查看 `src/config/website.tsx` 中的 `credits` 配置
- 查看服务器日志中是否有错误

**问题 3: Webhook 签名验证失败**
- 确认 `STRIPE_WEBHOOK_SECRET` 已设置
- 确认使用的是正确的 webhook 密钥（Stripe CLI 或 Dashboard）

## 📝 快速检查清单

完成这些步骤后，你的 Stripe 集成就完成了：

- [ ] 运行 `node scripts/get-stripe-prices.js` 获取价格 ID
- [ ] 更新 `.env.local` 中的价格 ID
- [ ] 更新 `src/config/website.tsx` 配置积分
- [ ] 配置 Webhook（Stripe CLI 或 Dashboard）
- [ ] 更新 `.env.local` 中的 `STRIPE_WEBHOOK_SECRET`
- [ ] 重启开发服务器
- [ ] 测试支付流程
- [ ] 验证积分是否正确添加

## 🎯 下一步建议

完成 Stripe 配置后：

1. **测试完整流程** - 从注册到支付到使用积分
2. **配置生产环境** - 使用生产 API 密钥和 Webhook
3. **添加更多计划** - 年度订阅、终身会员等
4. **设置积分包** - 一次性购买积分
5. **优化用户体验** - 添加订阅管理页面

## 💡 提示

当前你有两个支付系统：
- **Stripe** (在 `/pricing`) - 用于订阅和一次性支付
- **Creem** (在 `/creem-pricing`) - 测试用订阅系统

你可以选择：
1. 只使用 Stripe（推荐）
2. 为中国用户使用 Creem，国际用户使用 Stripe
3. 让用户选择支付方式

需要我帮你实现任何特定方案吗？
