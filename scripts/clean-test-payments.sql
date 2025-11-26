-- 清理测试支付记录的 SQL 脚本
-- ⚠️ 警告: 这会删除数据库中的支付记录！仅用于测试环境！

-- 查看所有订阅支付记录
SELECT
  id,
  price_id,
  user_id,
  subscription_id,
  status,
  paid,
  created_at
FROM payment
WHERE type = 'subscription'
ORDER BY created_at DESC;

-- 如果确认要删除，取消注释以下语句：

-- 删除所有测试订阅支付记录
-- DELETE FROM payment WHERE type = 'subscription';

-- 或者只删除特定用户的订阅
-- DELETE FROM payment WHERE user_id = 'your_user_id' AND type = 'subscription';

-- 或者只删除特定订阅 ID 的记录
-- DELETE FROM payment WHERE subscription_id = 'sub_xxxxx';

-- 验证删除结果
-- SELECT COUNT(*) FROM payment WHERE type = 'subscription';
