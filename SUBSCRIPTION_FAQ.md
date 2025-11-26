# 订阅系统常见问题解答

## 🤔 如果我既买 Basic，又买 Pro，订阅会怎样？

### 当前系统行为

根据当前的代码实现，如果你同时购买了 Basic 和 Pro：

#### 1. **Stripe 的默认行为**
- Stripe **允许**一个客户拥有多个活跃订阅
- 每个订阅都是独立的，有自己的：
  - 订阅 ID (`subscriptionId`)
  - 计费周期
  - 状态
  - 价格

#### 2. **数据库中的记录**
在 `payment` 表中，你会有**两条**不同的记录：

```
| id   | priceId  | userId | subscriptionId | status | paid |
|------|----------|--------|----------------|--------|------|
| p001 | price_basic | user123 | sub_basic_xxx | active | true |
| p002 | price_pro   | user123 | sub_pro_xxx   | active | true |
```

#### 3. **积分发放**
每次订阅续费时（`invoice.paid` webhook）：
- Basic 订阅 → 增加 **3500 积分**
- Pro 订阅 → 增加 **10000 积分**

**总计**：每个计费周期你会获得 **13500 积分**

#### 4. **账单情况**
- 你会收到**两张**独立的账单
- Basic: $29/月
- Pro: $69/月
- **总计**: $98/月

---

## ⚠️ 潜在问题

### 问题 1：用户可能不小心买了两个订阅
- ❌ 用户界面没有阻止购买第二个订阅
- ❌ 没有提示用户"你已有订阅，是否升级？"
- ❌ 没有自动取消旧订阅的机制

### 问题 2：订阅管理复杂
- 用户需要分别管理两个订阅
- 取消一个不会影响另一个

### 问题 3：计费混乱
- 两个订阅的计费日期可能不同
- 用户可能不清楚为什么被扣两次款

---

## ✅ 推荐的订阅策略

### 方案 A：单订阅制（推荐）

**特点**：一个用户同时只能有一个活跃订阅

**实现步骤**：

1. **购买前检查**
```typescript
// 在创建 checkout session 前检查
const existingSubscription = await getActiveSubscription(userId);

if (existingSubscription) {
  // 如果是升级
  if (newPlanPrice > existingSubscription.price) {
    return {
      action: 'upgrade',
      message: '你已有订阅，是否升级到 Pro？'
    };
  }
  // 如果是降级
  else {
    return {
      action: 'downgrade',
      message: '你已有 Pro 订阅，是否降级到 Basic？'
    };
  }
}
```

2. **使用 Stripe 订阅更新 API**
```typescript
// 升级/降级现有订阅，而不是创建新订阅
await stripe.subscriptions.update(existingSubscription.id, {
  items: [{
    id: existingSubscription.items.data[0].id,
    price: newPriceId,
  }],
  proration_behavior: 'always_invoice', // 按比例计费
});
```

3. **UI 改进**
- 在定价页面显示"当前订阅"标识
- 升级按钮 vs 降级按钮
- 显示按比例退款/补差价信息

---

### 方案 B：多订阅制（不推荐）

如果确实需要允许多订阅（比如家庭套餐、团队账户等）：

**需要改进**：

1. **明确告知用户**
```typescript
// 购买前提示
if (existingSubscription) {
  showWarning(
    '你已有订阅！购买新订阅不会取消现有订阅，你将被扣两次费用。'
  );
}
```

2. **订阅管理页面**
- 显示所有活跃订阅
- 每个订阅独立的取消按钮
- 显示总计费用

3. **积分系统调整**
- 考虑是否允许多订阅叠加积分
- 或者只取最高级别订阅的积分

---

## 🛠️ 如何实现单订阅制

### 步骤 1：添加订阅检查函数

创建 `src/actions/get-active-subscription.ts`：

```typescript
'use server';

import { getDb } from '@/db';
import { payment } from '@/db/schema';
import { userActionClient } from '@/lib/safe-action';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const schema = z.object({
  userId: z.string(),
});

export const getActiveSubscriptionAction = userActionClient
  .schema(schema)
  .action(async ({ parsedInput }) => {
    const { userId } = parsedInput;
    const db = await getDb();

    // 查找活跃订阅
    const subscriptions = await db
      .select()
      .from(payment)
      .where(
        and(
          eq(payment.userId, userId),
          eq(payment.type, 'subscription'),
          eq(payment.paid, true),
          eq(payment.cancelAtPeriodEnd, false)
        )
      );

    return {
      success: true,
      subscriptions,
      hasActive: subscriptions.length > 0,
    };
  });
```

### 步骤 2：修改 CheckoutButton

在 `src/components/pricing/checkout-button.tsx` 中：

```typescript
const handleClick = async () => {
  // 1. 检查是否已有订阅
  const { data } = await getActiveSubscriptionAction({ userId });

  if (data?.hasActive) {
    // 显示升级/降级对话框
    showUpgradeDialog({
      currentPlan: data.subscriptions[0].priceId,
      newPlan: priceId,
    });
    return;
  }

  // 2. 如果没有订阅，正常创建 checkout
  const result = await createCheckoutAction({...});
};
```

### 步骤 3：添加升级/降级逻辑

创建 `src/actions/update-subscription.ts`：

```typescript
'use server';

import { stripe } from '@/payment/provider/stripe';

export async function updateSubscriptionAction({
  subscriptionId,
  newPriceId,
}: {
  subscriptionId: string;
  newPriceId: string;
}) {
  // 获取现有订阅
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // 更新订阅项目
  await stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId,
    }],
    proration_behavior: 'always_invoice',
  });

  return { success: true };
}
```

---

## 📊 当前系统总结

| 特性 | 当前状态 | 推荐改进 |
|------|---------|---------|
| 多订阅 | ✅ 允许 | ⚠️ 应限制为单订阅 |
| 订阅检查 | ❌ 无 | ✅ 购买前检查 |
| 升级/降级 | ❌ 无 | ✅ 添加订阅更新功能 |
| 用户提示 | ❌ 无警告 | ✅ 明确告知用户 |
| 积分叠加 | ✅ 自动叠加 | ⚠️ 需确认是否合理 |

---

## 🎯 建议行动

### 短期（必须）
1. ✅ 在定价页面添加"当前订阅"显示
2. ✅ 购买前检查是否已有订阅
3. ✅ 显示警告信息

### 中期（推荐）
1. ✅ 实现订阅升级/降级功能
2. ✅ 添加订阅管理页面
3. ✅ 显示所有活跃订阅

### 长期（优化）
1. 考虑订阅打包优惠
2. 添加订阅暂停功能
3. 实现订阅转让功能

---

## 🔍 如何查看你的订阅

### 方法 1：Stripe Dashboard
1. 访问 https://dashboard.stripe.com/customers
2. 搜索你的邮箱
3. 查看 "Subscriptions" 标签

### 方法 2：数据库查询
```sql
SELECT
  id,
  price_id,
  subscription_id,
  status,
  period_start,
  period_end
FROM payment
WHERE user_id = '你的用户ID'
  AND type = 'subscription'
  AND paid = true
ORDER BY created_at DESC;
```

### 方法 3：Stripe CLI
```bash
stripe customers list --email your@email.com
stripe subscriptions list --customer cus_xxxxx
```

---

## ❓ 更多问题？

如果你有其他关于订阅的问题，请查看：
- [Stripe 订阅文档](https://stripe.com/docs/billing/subscriptions/overview)
- [项目文档](./README.md)
- 或联系技术支持

---

**最后更新**: 2025-01-25
**相关文件**:
- `src/payment/provider/stripe.ts`
- `src/db/schema.ts`
- `src/actions/create-checkout-session.ts`
