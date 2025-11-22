# Base64 图片上传到 Cloudflare R2 使用指南

## 概述

项目现在支持将 base64 编码的图片直接上传到 Cloudflare R2 存储。这对于 AI 生成的图片、Canvas 截图等场景非常有用。

## 环境配置

### 1. Cloudflare R2 设置

首先需要在 Cloudflare 创建 R2 存储桶并获取访问凭证：

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 R2 服务
3. 创建新的存储桶（Bucket）
4. 生成 API 令牌：
   - 进入 R2 → Manage R2 API Tokens
   - 点击 "Create API Token"
   - 选择权限：Object Read & Write
   - 记录生成的 Access Key ID 和 Secret Access Key

### 2. 环境变量配置

在 `.env.local` 文件中添加以下配置：

```bash
# Cloudflare R2 存储配置
STORAGE_REGION="auto"                                    # R2 默认使用 "auto"
STORAGE_BUCKET_NAME="your-bucket-name"                   # 你的 R2 存储桶名称
STORAGE_ACCESS_KEY_ID="your-access-key-id"              # R2 API Access Key ID
STORAGE_SECRET_ACCESS_KEY="your-secret-access-key"      # R2 API Secret Access Key
STORAGE_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"  # R2 端点
STORAGE_PUBLIC_URL="https://your-custom-domain.com"     # 可选：自定义域名
```

#### 获取 R2 Endpoint

R2 端点格式：`https://<account-id>.r2.cloudflarestorage.com`

- 在 Cloudflare Dashboard 的 R2 页面可以找到你的 account ID
- 或者在创建 API Token 后，会显示完整的端点 URL

#### 配置自定义域名（可选）

为了更好的性能和 SEO，建议配置自定义域名：

1. 在 R2 存储桶设置中，点击 "Settings" → "Public Access"
2. 添加自定义域名（需要该域名已经在 Cloudflare 托管）
3. 将自定义域名填入 `STORAGE_PUBLIC_URL`

如果不配置 `STORAGE_PUBLIC_URL`，将使用 R2 的默认端点。

## API 使用

### 服务端 API 端点

**POST** `/api/storage/upload-base64`

#### 请求格式

```typescript
{
  "base64": string,     // base64 编码的图片（支持带或不带 data URI 前缀）
  "filename"?: string,  // 可选：文件名（不提供则自动生成）
  "folder"?: string     // 可选：存储文件夹路径
}
```

#### 响应格式

```typescript
{
  "success": true,
  "url": "https://your-domain.com/uploads/uuid.png",  // 图片的公开访问 URL
  "key": "uploads/uuid.png",                           // 存储键值（用于删除）
  "size": 12345,                                       // 文件大小（字节）
  "mimeType": "image/png"                              // 文件类型
}
```

#### 错误响应

```typescript
{
  "error": "错误信息"
}
```

### 客户端使用

项目提供了便捷的客户端函数 `uploadBase64FromBrowser`：

#### 引入

```typescript
import { uploadBase64FromBrowser } from '@/storage/client';
```

#### 基本使用

```typescript
// 1. 带 data URI 前缀的 base64
const result = await uploadBase64FromBrowser(
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
  { folder: 'ai-images' }
);

console.log('图片 URL:', result.url);
console.log('文件大小:', result.size, 'bytes');
```

```typescript
// 2. 不带 data URI 前缀（默认为 PNG）
const result = await uploadBase64FromBrowser(
  'iVBORw0KGgoAAAANSUhEUgAA...',
  {
    filename: 'my-image.png',
    folder: 'uploads'
  }
);
```

```typescript
// 3. 从 Canvas 上传
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const base64 = canvas.toDataURL('image/png');

const result = await uploadBase64FromBrowser(base64, {
  filename: 'canvas-export.png',
  folder: 'canvas'
});
```

```typescript
// 4. 错误处理
try {
  const result = await uploadBase64FromBrowser(base64Data, {
    folder: 'uploads'
  });
  console.log('上传成功:', result.url);
} catch (error) {
  console.error('上传失败:', error.message);
}
```

## 实际应用示例

### 示例 1: AI 图片生成后上传

```typescript
'use client';

import { uploadBase64FromBrowser } from '@/storage/client';
import { useState } from 'react';

export function AIImageGenerator() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const generateAndUpload = async () => {
    try {
      // 1. 调用 AI 生成图片（假设返回 base64）
      const aiResponse = await fetch('/api/ai/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'A beautiful landscape' }),
      });
      const { base64Image } = await aiResponse.json();

      // 2. 上传到 R2
      setUploading(true);
      const result = await uploadBase64FromBrowser(base64Image, {
        folder: 'ai-generated',
        filename: `ai-${Date.now()}.png`,
      });

      setImageUrl(result.url);
      console.log('上传成功，大小:', result.size, 'bytes');
    } catch (error) {
      console.error('生成或上传失败:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button onClick={generateAndUpload} disabled={uploading}>
        {uploading ? '上传中...' : '生成并上传图片'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated" />}
    </div>
  );
}
```

### 示例 2: 图片编辑器保存

```typescript
'use client';

import { uploadBase64FromBrowser } from '@/storage/client';

export function ImageEditor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const saveCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 导出为 base64
    const base64 = canvas.toDataURL('image/png', 1.0);

    try {
      // 上传到 R2
      const result = await uploadBase64FromBrowser(base64, {
        folder: 'edited-images',
        filename: `edited-${Date.now()}.png`,
      });

      alert(`保存成功！URL: ${result.url}`);

      // 可以将 URL 保存到数据库
      await fetch('/api/images/save', {
        method: 'POST',
        body: JSON.stringify({
          url: result.url,
          key: result.key
        }),
      });
    } catch (error) {
      alert('保存失败: ' + error.message);
    }
  };

  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
      <button onClick={saveCanvas}>保存图片</button>
    </div>
  );
}
```

### 示例 3: 批量上传

```typescript
async function uploadMultipleImages(base64Images: string[]) {
  const results = await Promise.all(
    base64Images.map((base64, index) =>
      uploadBase64FromBrowser(base64, {
        folder: 'batch-upload',
        filename: `image-${index}.png`,
      })
    )
  );

  console.log('所有图片上传完成:', results);
  return results;
}
```

## 支持的图片格式

- JPEG/JPG
- PNG
- WebP
- GIF

## 限制

- 最大文件大小：10MB
- 超时时间：30 秒

## 服务端使用

如果需要在服务端（Server Actions）上传 base64 图片：

```typescript
import { uploadFile } from '@/storage';

export async function uploadBase64ServerSide(base64: string) {
  // 解析 base64
  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }

  const mimeType = matches[1];
  const base64Data = matches[2];
  const buffer = Buffer.from(base64Data, 'base64');

  // 上传
  const result = await uploadFile(
    buffer,
    `image-${Date.now()}.png`,
    mimeType,
    'server-uploads'
  );

  return result;
}
```

## 安全建议

1. **验证来源**：在生产环境中，建议添加身份验证
2. **限制大小**：已内置 10MB 限制，可根据需求调整
3. **速率限制**：考虑添加 API 速率限制防止滥用
4. **文件类型验证**：已限制为图片格式，确保安全

## 性能优化

1. **压缩图片**：上传前可以压缩 base64 图片
2. **使用 CDN**：配置 Cloudflare CDN 加速访问
3. **批量上传**：使用 `Promise.all` 并行上传多张图片

## 故障排查

### 上传失败

1. 检查环境变量是否正确配置
2. 确认 R2 API Token 有正确的权限
3. 检查 base64 格式是否正确
4. 查看控制台错误日志

### 无法访问图片

1. 确认 R2 存储桶的公开访问设置
2. 检查 `STORAGE_PUBLIC_URL` 配置
3. 确认自定义域名 DNS 解析正确

## 相关文件

- API 端点: [src/app/api/storage/upload-base64/route.ts](src/app/api/storage/upload-base64/route.ts)
- 客户端函数: [src/storage/client.ts](src/storage/client.ts)
- 存储配置: [src/storage/config/storage-config.ts](src/storage/config/storage-config.ts)
- R2 Provider: [src/storage/provider/s3.ts](src/storage/provider/s3.ts)
