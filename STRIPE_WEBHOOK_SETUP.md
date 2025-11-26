# Stripe Webhook 配置指南

## ✅ 已完成

- ✅ Stripe API 密钥已配置
- ✅ 价格 ID 已配置
  - Basic: `price_1SXCR1P1ZLuFE5ODt4Oqihpf` ($29/月 → 3500积分)
  - Pro: `price_1SXCRNP1ZLuFE5ODU72nB72e` ($69/月 → 10000积分)
- ✅ 积分配置已更新

## 🎯 现在需要配置 Webhook

### 方法 1: 使用 Stripe CLI（推荐用于开发环境）

#### 步骤 1: 安装 Stripe CLI

```bash
# macOS
brew install stripe/stripe-cli/stripe

# 其他系统参考: https://stripe.com/docs/stripe-cli#install
```

#### 步骤 2: 登录 Stripe

```bash
stripe login
```

会打开浏览器让你授权，完成后终端会显示成功消息。

#### 步骤 3: 转发 Webhook 到本地

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

**保持这个终端窗口运行！** 你会看到：

```
> Ready! You can now accept webhook events
> Your webhook signing secret is whsec_xxxxxxxxxxxxxxxxxxxxx
```

#### 步骤 4: 复制 Webhook Secret

复制 `whsec_` 开头的密钥，更新 `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_你复制的密钥"
```

#### 步骤 5: 重启开发服务器

```bash
# 在另一个终端窗口
# 停止当前开发服务器 (Ctrl+C)
pnpm dev
```

**注意**: Stripe CLI 窗口必须保持运行状态才能接收 webhook！

---

### 方法 2: 使用 ngrok（如果不想用 Stripe CLI）

你的 ngrok 已经在运行了（用于 Creem），可以复用。

#### 步骤 1: 获取 ngrok URL

当前 URL: `https://loricate-truthful-felica.ngrok-free.dev`

#### 步骤 2: 在 Stripe Dashboard 配置 Webhook

1. 访问 https://dashboard.stripe.com/webhooks
2. 点击 "添加端点" (Add endpoint)
3. 填写信息:
   - **端点 URL**: `https://loricate-truthful-felica.ngrok-free.dev/api/webhooks/stripe`
   - **描述**: Development Webhook
   - **监听事件**: 选择以下事件：
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.paid`
     - `invoice.payment_failed`

4. 点击 "添加端点"

#### 步骤 3: 获取 Webhook 签名密钥

1. 点击刚创建的 webhook 端点
2. 在 "签名密钥" (Signing secret) 部分点击 "显示"
3. 复制 `whsec_` 开头的密钥

#### 步骤 4: 更新环境变量

更新 `.env.local`:
```bash
STRIPE_WEBHOOK_SECRET="whsec_你的密钥"
```

#### 步骤 5: 重启开发服务器

```bash
pnpm dev
```

---

## 🧪 测试 Webhook

### 使用 Stripe CLI 测试（方法 1）

如果使用 Stripe CLI，webhook 事件会自动显示在终端：

```bash
# 在 stripe listen 的终端窗口，你会看到：
[200] POST /api/webhooks/stripe [evt_xxxxx]
```

### 使用 ngrok 测试（方法 2）

访问 http://localhost:4040 查看请求日志

### 测试支付流程

1. 访问 http://localhost:3000/pricing
2. 登录你的账户
3. 点击 Basic 或 Pro 的订阅按钮
4. 使用测试卡完成支付:
   - 卡号: `4242 4242 4242 4242`
   - 过期日期: 任何未来日期（如 12/34）
   - CVC: 任何 3 位数字（如 123）
   - 邮编: 任何 5 位数字（如 12345）

5. 支付成功后，检查:
   - ✅ Webhook 是否收到（Stripe CLI 或 ngrok 日志）
   - ✅ 服务器日志是否显示积分添加
   - ✅ 用户积分余额是否增加

---

## 📊 验证积分是否添加

### 方法 1: 查看服务器日志

在开发服务器的终端查找：

```
addSubscriptionCredits, 3500 credits for user xxxxx  // Basic
或
addSubscriptionCredits, 10000 credits for user xxxxx  // Pro
```

### 方法 2: 查看数据库

```sql
-- 查看用户积分
SELECT * FROM user_credit WHERE user_id = '你的用户ID';

-- 查看积分交易记录
SELECT * FROM credit_transaction WHERE user_id = '你的用户ID' ORDER BY created_at DESC;
```

### 方法 3: 在应用中查看

如果你的应用有积分余额显示，直接查看用户界面。

---

## 🐛 常见问题

### 问题 1: Webhook 签名验证失败

**错误信息**: `Webhook signature verification failed`

**解决方案**:
1. 确认 `STRIPE_WEBHOOK_SECRET` 已正确配置
2. 确认使用的是对应方法的正确密钥:
   - Stripe CLI: 从 `stripe listen` 输出中复制
   - Dashboard: 从 webhook 端点详情页复制
3. 重启开发服务器

### 问题 2: Webhook 未收到

**使用 Stripe CLI**:
- 确认 `stripe listen` 正在运行
- 检查终端是否有错误信息

**使用 ngrok**:
- 确认 ngrok 正在运行
- 访问 http://localhost:4040 查看是否收到请求
- 检查 Stripe Dashboard 的 webhook 日志

### 问题 3: 支付成功但没有积分

**检查步骤**:
1. 确认 webhook 已收到 `invoice.paid` 事件
2. 查看服务器日志是否有错误
3. 确认 `src/config/website.tsx` 中的 credits 配置正确:
   ```typescript
   credits: {
     enable: true,  // 必须为 true
     amount: 3500,  // Basic 或 10000 for Pro
     expireDays: 30,
   }
   ```
4. 确认价格 ID 匹配

---

## ✅ 配置完成检查清单

- [ ] Webhook 已配置（Stripe CLI 或 Dashboard）
- [ ] `STRIPE_WEBHOOK_SECRET` 已添加到 `.env.local`
- [ ] 开发服务器已重启
- [ ] 测试支付流程
- [ ] 确认 webhook 收到事件
- [ ] 确认积分正确添加

完成以上所有步骤后，Stripe 集成就完全配置好了！🎉

---

## 🚀 下一步

1. **测试完整流程** - 从注册到支付到使用积分
2. **配置生产环境** - 更新生产环境的 webhook URL
3. **添加订阅管理** - 让用户可以取消/升级订阅
4. **监控和日志** - 设置 Stripe webhook 事件的监控

需要帮助？查看:
- [Stripe Dashboard](https://dashboard.stripe.com)
- [Webhook 日志](https://dashboard.stripe.com/webhooks)
- [测试卡号](https://stripe.com/docs/testing)
