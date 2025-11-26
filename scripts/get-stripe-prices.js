#!/usr/bin/env node

/**
 * 获取 Stripe 价格 ID 的脚本
 *
 * 使用方法:
 * node scripts/get-stripe-prices.js
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function getPrices() {
  try {
    console.log('🔍 正在获取 Stripe 价格信息...\n');

    // 获取产品列表
    const products = await stripe.products.list({ limit: 100 });

    console.log(`📦 找到 ${products.data.length} 个产品:\n`);

    // 遍历每个产品
    for (const product of products.data) {
      console.log(`产品名称: ${product.name}`);
      console.log(`产品 ID: ${product.id}`);
      console.log(`描述: ${product.description || '无'}`);

      // 获取该产品的价格
      const prices = await stripe.prices.list({
        product: product.id,
        limit: 100,
      });

      if (prices.data.length > 0) {
        console.log('价格信息:');
        prices.data.forEach((price) => {
          const amount = (price.unit_amount / 100).toFixed(2);
          const currency = price.currency.toUpperCase();
          const interval = price.recurring
            ? ` / ${price.recurring.interval}`
            : ' (一次性)';

          console.log(`  ├─ 价格 ID: ${price.id}`);
          console.log(`  ├─ 金额: ${amount} ${currency}${interval}`);
          console.log(`  └─ 状态: ${price.active ? '✅ 激活' : '❌ 未激活'}`);
        });
      } else {
        console.log('  └─ ⚠️  该产品没有配置价格');
      }

      console.log('\n' + '─'.repeat(60) + '\n');
    }

    console.log('✅ 完成！\n');
    console.log('📝 请将上面显示的价格 ID 复制到 .env.local 文件中');
    console.log('   格式: NEXT_PUBLIC_STRIPE_PRICE_XXX="price_xxxxx"\n');
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  请确保 STRIPE_SECRET_KEY 环境变量已正确设置');
      console.error('   当前值:', process.env.STRIPE_SECRET_KEY ? '已设置' : '未设置');
    }
  }
}

// 检查是否提供了 Stripe 密钥
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ 错误: 未找到 STRIPE_SECRET_KEY 环境变量');
  console.error('\n使用方法:');
  console.error('  STRIPE_SECRET_KEY=sk_xxx node scripts/get-stripe-prices.js');
  console.error('\n或者在 .env.local 中设置 STRIPE_SECRET_KEY 后运行:');
  console.error('  node scripts/get-stripe-prices.js');
  process.exit(1);
}

getPrices();
