#!/usr/bin/env node

/**
 * 创建 Stripe 测试产品和价格的脚本
 *
 * 使用方法:
 * node scripts/create-stripe-products.js
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createProducts() {
  try {
    console.log('🚀 开始创建 Stripe 测试产品...\n');

    // 创建 Basic 产品
    console.log('📦 创建 Basic 产品...');
    const basicProduct = await stripe.products.create({
      name: 'Basic',
      description: '基础计划 - 每月3500积分',
      metadata: {
        credits: '3500',
        plan: 'basic',
      },
    });
    console.log(`✅ Basic 产品已创建: ${basicProduct.id}\n`);

    // 创建 Basic 月度价格
    console.log('💰 创建 Basic 月度价格...');
    const basicPrice = await stripe.prices.create({
      product: basicProduct.id,
      unit_amount: 2900, // $29.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        credits: '3500',
        plan: 'basic',
      },
    });
    console.log(`✅ Basic 月度价格已创建: ${basicPrice.id}`);
    console.log(`   金额: $${(basicPrice.unit_amount / 100).toFixed(2)} USD / 月\n`);

    // 创建 Pro 产品
    console.log('📦 创建 Pro 产品...');
    const proProduct = await stripe.products.create({
      name: 'Pro',
      description: '专业计划 - 每月10000积分',
      metadata: {
        credits: '10000',
        plan: 'pro',
      },
    });
    console.log(`✅ Pro 产品已创建: ${proProduct.id}\n`);

    // 创建 Pro 月度价格
    console.log('💰 创建 Pro 月度价格...');
    const proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 6900, // $69.00
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        credits: '10000',
        plan: 'pro',
      },
    });
    console.log(`✅ Pro 月度价格已创建: ${proPrice.id}`);
    console.log(`   金额: $${(proPrice.unit_amount / 100).toFixed(2)} USD / 月\n`);

    // 显示总结
    console.log('─'.repeat(60));
    console.log('🎉 所有产品创建成功！\n');
    console.log('📝 请将以下价格 ID 复制到 .env.local 文件中:\n');
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_BASIC_MONTHLY="${basicPrice.id}"`);
    console.log(`NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY="${proPrice.id}"`);
    console.log('\n' + '─'.repeat(60) + '\n');

    // 返回价格 ID 供后续使用
    return {
      basicPriceId: basicPrice.id,
      proPriceId: proPrice.id,
    };
  } catch (error) {
    console.error('❌ 错误:', error.message);
    if (error.type === 'StripeAuthenticationError') {
      console.error('\n⚠️  请确保 STRIPE_SECRET_KEY 环境变量已正确设置');
      console.error('   当前值:', process.env.STRIPE_SECRET_KEY ? '已设置' : '未设置');
    }
    process.exit(1);
  }
}

// 检查是否提供了 Stripe 密钥
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ 错误: 未找到 STRIPE_SECRET_KEY 环境变量');
  console.error('\n使用方法:');
  console.error('  STRIPE_SECRET_KEY=sk_test_xxx node scripts/create-stripe-products.js');
  console.error('\n或者在 .env.local 中设置 STRIPE_SECRET_KEY 后运行:');
  console.error('  node scripts/create-stripe-products.js');
  process.exit(1);
}

createProducts();
