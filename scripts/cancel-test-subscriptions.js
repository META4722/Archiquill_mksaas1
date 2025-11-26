#!/usr/bin/env node

/**
 * 取消测试订阅的脚本
 *
 * 使用方法:
 * node scripts/cancel-test-subscriptions.js your@email.com
 *
 * 或者取消所有活跃订阅:
 * node scripts/cancel-test-subscriptions.js --all
 */

// 加载环境变量
require('dotenv').config({ path: '.env.local' });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function cancelSubscriptions(email) {
  try {
    console.log('🔍 正在查找订阅...\n');

    let subscriptions = [];

    if (email === '--all') {
      // 获取所有活跃订阅
      console.log('📋 获取所有活跃订阅...\n');
      const allSubs = await stripe.subscriptions.list({
        status: 'active',
        limit: 100,
      });
      subscriptions = allSubs.data;
    } else {
      // 先找到客户
      const customers = await stripe.customers.list({
        email: email,
        limit: 10,
      });

      if (customers.data.length === 0) {
        console.log(`❌ 未找到邮箱为 ${email} 的客户`);
        return;
      }

      console.log(`✅ 找到 ${customers.data.length} 个客户\n`);

      // 获取每个客户的订阅
      for (const customer of customers.data) {
        console.log(`客户 ID: ${customer.id}`);
        console.log(`客户邮箱: ${customer.email}`);

        const customerSubs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'active',
        });

        subscriptions.push(...customerSubs.data);
      }
    }

    if (subscriptions.length === 0) {
      console.log('\n✅ 没有找到活跃订阅');
      return;
    }

    console.log(`\n📦 找到 ${subscriptions.length} 个活跃订阅:\n`);

    // 显示所有订阅
    for (const sub of subscriptions) {
      const price = sub.items.data[0]?.price;
      const amount = price ? (price.unit_amount / 100).toFixed(2) : 'N/A';
      const currency = price?.currency?.toUpperCase() || 'N/A';
      const interval = price?.recurring?.interval || 'N/A';

      console.log(`订阅 ID: ${sub.id}`);
      console.log(`  客户 ID: ${sub.customer}`);
      console.log(`  价格: ${amount} ${currency} / ${interval}`);
      console.log(`  状态: ${sub.status}`);
      console.log(`  创建时间: ${new Date(sub.created * 1000).toLocaleString()}`);
      console.log('');
    }

    // 询问确认
    console.log('⚠️  即将取消上述所有订阅！');
    console.log('按 Ctrl+C 取消操作，或等待 5 秒后自动继续...\n');

    // 等待 5 秒
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 取消所有订阅
    console.log('🗑️  开始取消订阅...\n');

    for (const sub of subscriptions) {
      try {
        await stripe.subscriptions.cancel(sub.id);
        console.log(`✅ 已取消订阅: ${sub.id}`);
      } catch (error) {
        console.error(`❌ 取消订阅 ${sub.id} 失败:`, error.message);
      }
    }

    console.log('\n🎉 完成！\n');
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
  console.error('  STRIPE_SECRET_KEY=sk_test_xxx node scripts/cancel-test-subscriptions.js your@email.com');
  console.error('\n或者在 .env.local 中设置 STRIPE_SECRET_KEY 后运行:');
  console.error('  node scripts/cancel-test-subscriptions.js your@email.com');
  console.error('\n取消所有活跃订阅:');
  console.error('  node scripts/cancel-test-subscriptions.js --all');
  process.exit(1);
}

// 获取命令行参数
const email = process.argv[2];

if (!email) {
  console.error('❌ 错误: 请提供客户邮箱或使用 --all');
  console.error('\n使用方法:');
  console.error('  node scripts/cancel-test-subscriptions.js your@email.com');
  console.error('  node scripts/cancel-test-subscriptions.js --all');
  process.exit(1);
}

cancelSubscriptions(email);
