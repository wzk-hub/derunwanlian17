import { useState } from 'react';
import AdvancedSliderCaptcha from '@/components/AdvancedSliderCaptcha';
import { toast } from 'sonner';

export default function CaptchaTest() {
  const [verified, setVerified] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  const handleSuccess = () => {
    setVerified(true);
    toast.success('验证成功！');
  };

  const handleFail = () => {
    setVerified(false);
    toast.error('验证失败，请重试');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                滑块验证测试
              </h2>
              <p className="text-gray-500">
                测试高级滑块验证功能，包含反机器人检测
              </p>
            </div>

            {/* 难度选择 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择难度
              </label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as const).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      difficulty === level
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level === 'easy' ? '简单' : level === 'medium' ? '中等' : '困难'}
                  </button>
                ))}
              </div>
            </div>

            {/* 滑块验证 */}
            <AdvancedSliderCaptcha
              onSuccess={handleSuccess}
              onFail={handleFail}
              difficulty={difficulty}
            />

            {/* 验证状态 */}
            {verified && (
              <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
                <i className="fa-solid fa-check-circle mr-2"></i>
                <span>验证通过！您可以继续操作</span>
              </div>
            )}

            {/* 说明 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">验证说明：</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 将滑块拖到蓝色标记位置</li>
                <li>• 系统会检测操作行为是否为真人</li>
                <li>• 不同难度有不同的检测标准</li>
                <li>• 支持鼠标和触摸操作</li>
              </ul>
            </div>

            {/* 重置按钮 */}
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setVerified(false);
                  window.location.reload();
                }}
                className="text-blue-600 hover:text-blue-800 font-medium focus:outline-none"
              >
                重新测试
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}