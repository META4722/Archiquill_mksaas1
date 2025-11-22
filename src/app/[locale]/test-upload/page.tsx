'use client';

import { uploadBase64FromBrowser } from '@/storage/client';
import { useState } from 'react';

export default function TestUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<{
    url: string;
    key: string;
    size: number;
    mimeType: string;
  } | null>(null);
  const [error, setError] = useState<string>('');
  const [base64Input, setBase64Input] = useState('');

  // 测试用的小图片 (1x1 红色像素)
  const testBase64 =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

  const handleTestUpload = async () => {
    setUploading(true);
    setError('');
    setResult(null);

    try {
      const uploadResult = await uploadBase64FromBrowser(testBase64, {
        folder: 'test',
        filename: `test-${Date.now()}.png`,
      });

      setResult(uploadResult);
      console.log('上传成功:', uploadResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败';
      setError(errorMessage);
      console.error('上传失败:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUpload = async () => {
    if (!base64Input.trim()) {
      setError('请输入 base64 数据');
      return;
    }

    setUploading(true);
    setError('');
    setResult(null);

    try {
      const uploadResult = await uploadBase64FromBrowser(base64Input, {
        folder: 'custom',
        filename: `custom-${Date.now()}.png`,
      });

      setResult(uploadResult);
      console.log('上传成功:', uploadResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '上传失败';
      setError(errorMessage);
      console.error('上传失败:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件');
      return;
    }

    // 检查文件大小 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('文件大小不能超过 10MB');
      return;
    }

    // 读取文件并转换为 base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setBase64Input(base64);

      // 自动上传
      setUploading(true);
      setError('');
      setResult(null);

      try {
        const uploadResult = await uploadBase64FromBrowser(base64, {
          folder: 'uploads',
          filename: file.name,
        });

        setResult(uploadResult);
        console.log('上传成功:', uploadResult);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '上传失败';
        setError(errorMessage);
        console.error('上传失败:', err);
      } finally {
        setUploading(false);
      }
    };

    reader.onerror = () => {
      setError('读取文件失败');
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cloudflare R2 上传测试</h1>

        {/* 测试快速上传 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            1. 快速测试（1x1 像素图片）
          </h2>
          <button
            onClick={handleTestUpload}
            disabled={uploading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? '上传中...' : '测试上传'}
          </button>
        </div>

        {/* 文件选择上传 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">2. 选择文件上传</h2>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          <p className="text-sm text-gray-500 mt-2">
            支持 JPEG, PNG, WebP, GIF，最大 10MB
          </p>
        </div>

        {/* 自定义 base64 上传 */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">3. 自定义 Base64 上传</h2>
          <textarea
            value={base64Input}
            onChange={(e) => setBase64Input(e.target.value)}
            placeholder="粘贴 base64 数据（支持带或不带 data URI 前缀）"
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={uploading}
          />
          <button
            onClick={handleCustomUpload}
            disabled={uploading || !base64Input.trim()}
            className="mt-3 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="text-red-800 font-semibold mb-1">上传失败</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* 上传结果 */}
        {result && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-green-800 font-semibold mb-4">上传成功！</h3>

            <div className="space-y-3 mb-4">
              <div>
                <span className="font-medium">URL:</span>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-blue-600 hover:underline break-all"
                >
                  {result.url}
                </a>
              </div>
              <div>
                <span className="font-medium">Key:</span>
                <code className="ml-2 bg-gray-100 px-2 py-1 rounded">
                  {result.key}
                </code>
              </div>
              <div>
                <span className="font-medium">大小:</span>
                <span className="ml-2">
                  {(result.size / 1024).toFixed(2)} KB
                </span>
              </div>
              <div>
                <span className="font-medium">类型:</span>
                <span className="ml-2">{result.mimeType}</span>
              </div>
            </div>

            {/* 预览图片 */}
            <div className="mt-4">
              <p className="font-medium mb-2">预览:</p>
              <img
                src={result.url}
                alt="Uploaded"
                className="max-w-full max-h-96 border border-gray-300 rounded-lg"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* 环境配置信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-blue-800 font-semibold mb-2">配置信息</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Bucket: archiquill</li>
            <li>• Region: auto</li>
            <li>
              • Endpoint:
              https://5a61f966cf1cba6036269623117c4b91.r2.cloudflarestorage.com
            </li>
            <li>• API: /api/storage/upload-base64</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
