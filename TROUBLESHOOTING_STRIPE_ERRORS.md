# Stripe Checkout 错误排查指南

## 🔴 错误信息

```
Create checkout session error, result: Object
```

这个错误出现在 [src/components/pricing/create-checkout-button.tsx:104](src/components/pricing/create-checkout-button.tsx#L104)

## 🔍 问题分析

当你看到 `result: Object` 而不是成功的 checkout URL 时，说明服务器返回了错误但没有正确传递。

### 可能的原因

1. **环境变量未配置**
2. **Stripe 密钥错误**
3. **价格 ID 不存在**
4. **Webhook Secret 配置错误**
5. **数据库连接问题**

---

## ✅ 逐步排查方法

### 第 1 步：检查浏览器控制台

1. 打开浏览器开发者工具 (F12)
2. 切换到 "Console" 标签
3. 点击订阅按钮
4. 查看完整的错误信息：

```javascript
// 正确的输出应该是：
result: {
  data: {
    success: true,
    data: {
      url: "https://checkout.stripe.com/..."
    }
  }
}

// 错误的输出可能是：
result: {
  data: {
    success: false,
    error: "具体错误信息"
  }
}
```

### 第 2 步：检查网络请求

1. 开发者工具切换到 "Network" 标签
2. 点击订阅按钮
3. 找到 `create-checkout-session` 请求
4. 查看：
   - **Request Payload** - 发送的数据
   - **Response** - 服务器返回的数据
   - **Status Code** - HTTP 状态码

**正常情况**：
- Status: 200 OK
- Response: `{ success: true, data: { url: "..." } }`

**异常情况**：
- Status: 500 Internal Server Error
- Status: 400 Bad Request
- Response: `{ success: false, error: "..." }`

### 第 3 步：检查服务器日志

#### 在 Vercel 上查看日志

1. 访问 https://vercel.com/dashboard
2. 选择你的项目
3. 点击 "Logs" 标签
4. 筛选 "Error" 级别的日志
5. 查找与 Stripe 相关的错误

#### 常见错误日志

```bash
# 错误 1: Stripe API 密钥无效
Error: Invalid API Key provided

# 错误 2: 价格 ID 不存在
Error: No such price: 'price_xxxxx'

# 错误 3: Webhook Secret 错误
Error: No signatures found matching the expected signature

# 错误 4: 数据库连接失败
Error: Connection terminated unexpectedly
```

---

## 🛠️ 解决方案

### 方案 1：检查环境变量配置

在 Vercel Dashboard 中检查以下环境变量：

1. 访问：项目 → Settings → Environment Variables

2. **必须配置的变量**：

```bash
# 1. Stripe 密钥（生产环境）
STRIPE_SECRET_KEY=sk_live_xxxxx  # ❌ 不是 sk_test_

# 2. Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# 3. 价格 ID
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx

# 4. 基础 URL
NEXT_PUBLIC_BASE_URL=https://你的域名.com

# 5. 数据库
DATABASE_URL=postgresql://...

# 6. 认证密钥
BETTER_AUTH_SECRET=xxxxx
```

3. **检查要点**：
   - ✅ 变量名拼写正确（大小写敏感）
   - ✅ 值没有多余的空格或引号
   - ✅ 使用生产密钥（`sk_live_` 而不是 `sk_test_`）
   - ✅ 环境设置为 "Production"

### 方案 2：验证 Stripe 配置

#### 步骤 A：验证 API 密钥

```bash
# 使用 Stripe CLI 测试密钥
stripe --api-key sk_live_xxxxx customers list --limit 1

# 如果密钥有效，会返回客户列表
# 如果密钥无效，会返回错误
```

#### 步骤 B：验证价格 ID

1. 访问 https://dashboard.stripe.com/products
2. **关闭测试模式**（右上角开关）
3. 检查 Basic 和 Pro 产品
4. 确认价格 ID 与环境变量匹配

**对比检查**：
```bash
# Stripe Dashboard 显示的价格 ID
价格 ID: price_1abc123...

# Vercel 环境变量中的值
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_1abc123...

# ✅ 必须完全一致
```

#### 步骤 C：测试 API 密钥

创建测试脚本 `test-stripe-key.js`：

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function testStripeKey() {
  try {
    // 测试 1: 列出价格
    console.log('Testing Stripe API key...');
    const prices = await stripe.prices.list({ limit: 3 });
    console.log('✅ API key is valid');
    console.log('Found prices:', prices.data.map(p => p.id));

    // 测试 2: 检查特定价格
    const basicPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY;
    const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY;

    if (basicPriceId) {
      const basicPrice = await stripe.prices.retrieve(basicPriceId);
      console.log('✅ Basic price exists:', basicPrice.id);
    }

    if (proPriceId) {
      const proPrice = await stripe.prices.retrieve(proPriceId);
      console.log('✅ Pro price exists:', proPrice.id);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStripeKey();
```

运行测试：
```bash
# 本地测试
STRIPE_SECRET_KEY=sk_live_xxxxx \
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_xxxxx \
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_xxxxx \
node test-stripe-key.js
```

### 方案 3：添加详细错误日志

修改 [src/components/pricing/create-checkout-button.tsx](src/components/pricing/create-checkout-button.tsx)：

```typescript
// 在第 104 行附近，添加更详细的日志
if (result?.data?.success && result.data.data?.url) {
  window.location.href = result.data.data?.url;
} else {
  // 🔍 添加详细的错误信息
  console.error('=== Checkout Error Details ===');
  console.error('Full result:', JSON.stringify(result, null, 2));
  console.error('Success:', result?.data?.success);
  console.error('Error message:', result?.data?.error);
  console.error('Server error:', result?.serverError);
  console.error('Validation errors:', result?.validationErrors);
  console.error('============================');

  toast.error(
    result?.data?.error ||
    result?.serverError?.message ||
    t('checkoutFailed')
  );
}
```

### 方案 4：检查服务器端 Action

查看 [src/actions/create-checkout-session.ts](src/actions/create-checkout-session.ts) 的错误处理：

```typescript
// 确保错误被正确返回
catch (error) {
  console.error('create checkout session error:', error);
  return {
    success: false,
    error: error instanceof Error ? error.message : 'Something went wrong',
  };
}
```

---

## 🔧 常见问题修复

### 问题 1: "Invalid API Key"

**症状**：
```
Error: Invalid API Key provided
```

**解决**：
1. 检查 `STRIPE_SECRET_KEY` 是否以 `sk_live_` 开头
2. 确认没有多余的空格或引号
3. 在 Stripe Dashboard 重新生成密钥

### 问题 2: "No such price"

**症状**：
```
Error: No such price: 'price_xxxxx'
```

**解决**：
1. 确认使用的是**生产环境**的价格 ID
2. 在 Stripe Dashboard（生产模式）中验证价格存在
3. 重新运行 `node scripts/get-stripe-prices.js` 获取正确的 ID

### 问题 3: "Customer email is required"

**症状**：
```
Error: Customer email is required
```

**解决**：
1. 确认用户已登录
2. 检查 `userId` 是否正确传递
3. 验证数据库中用户邮箱存在

### 问题 4: 环境变量未生效

**症状**：
- 本地开发正常
- 生产环境报错

**解决**：
1. 在 Vercel 中重新部署
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push
   ```

2. 或在 Vercel Dashboard 手动重新部署
   - 进入项目
   - Deployments 标签
   - 点击最新部署的 "..." 菜单
   - 选择 "Redeploy"

---

## 📋 完整检查清单

### 环境变量检查
- [ ] `STRIPE_SECRET_KEY` 已配置（sk_live_ 开头）
- [ ] `STRIPE_WEBHOOK_SECRET` 已配置
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY` 已配置
- [ ] `NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY` 已配置
- [ ] `NEXT_PUBLIC_BASE_URL` 设置为生产域名
- [ ] `DATABASE_URL` 已配置
- [ ] `BETTER_AUTH_SECRET` 已配置

### Stripe 配置检查
- [ ] Stripe Dashboard 处于生产模式（非测试模式）
- [ ] API 密钥有效且未过期
- [ ] 价格 ID 存在于生产环境
- [ ] 产品已激活
- [ ] Webhook 已配置（稍后需要）

### 测试步骤
- [ ] 浏览器控制台无 JavaScript 错误
- [ ] Network 请求返回 200 状态码
- [ ] Vercel 日志无错误
- [ ] 能够成功创建 checkout session
- [ ] 能够重定向到 Stripe checkout 页面

---

## 🚨 紧急调试步骤

如果以上都无法解决，按以下步骤操作：

### 1. 启用测试模式临时验证

```bash
# 暂时使用测试密钥
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_test_xxxxx
```

如果测试模式可以工作，说明问题在于生产配置。

### 2. 查看完整的服务器响应

在浏览器控制台运行：

```javascript
// 手动调用 action 查看详细响应
const result = await fetch('/api/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: '你的用户ID',
    planId: 'basic',
    priceId: 'price_xxxxx'
  })
});

const data = await result.json();
console.log('Full response:', data);
```

### 3. 联系支持

如果仍然无法解决，收集以下信息：

1. 浏览器控制台的完整错误信息（截图）
2. Network 请求的详细信息（截图）
3. Vercel 日志的相关部分（复制文本）
4. 你的 Stripe Dashboard 配置（不要包含密钥！）

---

## 💡 预防措施

### 开发环境与生产环境分离

创建 `.env.production`：

```bash
# 生产环境专用
STRIPE_SECRET_KEY=sk_live_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_live_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_live_xxxxx
```

创建 `.env.development`：

```bash
# 开发环境专用
STRIPE_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY=price_test_xxxxx
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_test_xxxxx
```

### 添加环境检测

在代码中添加检测：

```typescript
// 在 create-checkout-session.ts 开头
if (process.env.NODE_ENV === 'production') {
  if (!process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_')) {
    throw new Error('Production must use live Stripe key');
  }
}
```

---

## 📞 需要帮助？

1. **查看 Stripe 文档**: https://stripe.com/docs
2. **Stripe 支持**: https://support.stripe.com
3. **检查 Stripe 状态**: https://status.stripe.com

---

**最后更新**: 2025-01-25
