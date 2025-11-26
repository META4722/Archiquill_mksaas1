# Stripe 快速开始指南

## 🚀 5 分钟配置 Stripe

### Step 1: 获取 Stripe API 密钥（2分钟）

1. 访问 https://dashboard.stripe.com/register （如果还没账户）
2. 登录后，点击左侧菜单的 "开发者"
3. 点击 "API 密钥"
4. 确保在 **测试模式** (Test mode)
5. 复制两个密钥：
   ```
   Publishable key: pk_test_51xxxxx
   Secret key: sk_test_51xxxxx
   ```

### Step 2: 创建产品（2分钟）

**快速创建必需产品：**

1. 点击 "产品" → "添加产品"
2. 创建 Pro 月度订阅：
   - 名称: `Pro Monthly`
   - 价格: `99` CNY
   - 计费周期: `月度`
   - 点击保存
   - **复制价格 ID**: `price_xxxxx`

3. 重复创建 Pro 年度：
   - 名称: `Pro Yearly`
   - 价格: `990` CNY
   - 计费周期: `年度`
   - **复制价格 ID**: `price_xxxxx`

### Step 3: 配置环境变量（1分钟）

打开 `.env.local`，添加或更新以下内容：

```bash
# Stripe 支付
STRIPE_SECRET_KEY="sk_test_你复制的密钥"

# Stripe 价格 ID
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="price_你复制的ID"
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY="price_你复制的ID"

# 暂时留空（稍后配置）
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PRICE_LIFETIME=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_BASIC=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_STANDARD=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_PREMIUM=""
NEXT_PUBLIC_STRIPE_PRICE_CREDITS_ENTERPRISE=""
```

### Step 4: 配置 Webhook（推荐使用 Stripe CLI）

**安装 Stripe CLI (macOS):**
```bash
brew install stripe/stripe-cli/stripe
```

**启动 Webhook 监听:**
```bash
# 登录
stripe login

# 转发 webhook
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

会显示：
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

复制 `whsec_xxxxx` 到 `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_你复制的密钥"
```

### Step 5: 重启并测试

```bash
# 停止开发服务器
# 重新启动
pnpm dev
```

访问 http://localhost:3000/pricing

**使用测试卡:**
- 卡号: `4242 4242 4242 4242`
- 过期日期: 任何未来日期
- CVC: 任何 3 位数字

## ✅ 完成！

现在你有：
- ✅ Stripe 支付在 `/pricing` 页面
- ✅ Creem 支付在 `/creem-pricing` 页面

## 🎯 推荐的使用场景

### 方案 A: 分离使用
- **Creem** → 中国用户订阅
- **Stripe** → 国际用户订阅 + 积分包购买

### 方案 B: Stripe 为主
- **Stripe** → 所有订阅和一次性支付
- **Creem** → 备用方案

### 方案 C: 按功能分
- **Creem** → 订阅管理
- **Stripe** → 积分包购买

## 📝 待办事项（可选）

如果需要完整功能：
- [ ] 创建终身会员产品
- [ ] 创建积分包产品（Basic, Standard, Premium, Enterprise）
- [ ] 配置生产环境密钥
- [ ] 配置生产环境 Webhook

## 🆘 遇到问题？

### Stripe 支付失败
1. 检查 `.env.local` 中的 `STRIPE_SECRET_KEY`
2. 确认价格 ID 正确
3. 查看浏览器控制台错误

### Webhook 未收到
1. 确认 Stripe CLI 正在运行
2. 检查 `STRIPE_WEBHOOK_SECRET` 是否配置
3. 查看终端日志

### 价格 ID 错误
1. 确认使用的是 `price_xxxxx` 不是 `prod_xxxxx`
2. 检查是否在测试模式下创建的产品
3. 确认环境变量名称正确
