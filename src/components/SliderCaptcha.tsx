import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SliderCaptchaProps {
  onSuccess: () => void;
  onFail: () => void;
  disabled?: boolean;
}

export default function SliderCaptcha({ onSuccess, onFail, disabled = false }: SliderCaptchaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const sliderStartXRef = useRef(0);

  // 生成随机目标位置
  useEffect(() => {
    if (trackRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const sliderWidth = 40; // 滑块宽度
      const maxPosition = trackWidth - sliderWidth;
      const randomPosition = Math.floor(Math.random() * (maxPosition - 50)) + 25; // 确保不在边缘
      setTargetPosition(randomPosition);
    }
  }, []);

  // 重置验证
  const resetCaptcha = () => {
    setSliderPosition(0);
    setIsCompleted(false);
    setIsFailed(false);
    setIsDragging(false);
    
    // 重新生成目标位置
    if (trackRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const sliderWidth = 40;
      const maxPosition = trackWidth - sliderWidth;
      const randomPosition = Math.floor(Math.random() * (maxPosition - 50)) + 25;
      setTargetPosition(randomPosition);
    }
  };

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isCompleted) return;
    
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    sliderStartXRef.current = sliderPosition;
    
    // 添加全局鼠标事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isCompleted) return;
    
    setIsDragging(true);
    startXRef.current = e.touches[0].clientX;
    sliderStartXRef.current = sliderPosition;
  };

  // 处理鼠标移动
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(sliderStartXRef.current + deltaX, 
      (trackRef.current?.offsetWidth || 0) - 40));
    
    setSliderPosition(newPosition);
  };

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = e.touches[0].clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(sliderStartXRef.current + deltaX, 
      (trackRef.current?.offsetWidth || 0) - 40));
    
    setSliderPosition(newPosition);
  };

  // 处理鼠标释放
  const handleMouseUp = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    checkPosition();
  };

  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    checkPosition();
  };

  // 检查位置是否正确
  const checkPosition = () => {
    const tolerance = 5; // 允许的误差范围
    const isCorrect = Math.abs(sliderPosition - targetPosition) <= tolerance;
    
    if (isCorrect) {
      setIsCompleted(true);
      onSuccess();
    } else {
      setIsFailed(true);
      setAttempts(prev => prev + 1);
      onFail();
      
      // 自动重置
      setTimeout(() => {
        resetCaptcha();
      }, 1000);
    }
  };

  // 清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">
          请完成滑块验证
        </span>
        {attempts > 0 && (
          <span className="text-xs text-red-500">
            验证失败 {attempts} 次
          </span>
        )}
      </div>
      
      <div className="relative">
        {/* 验证轨道 */}
        <div
          ref={trackRef}
          className={cn(
            "relative h-10 bg-gray-100 rounded-lg border-2 border-dashed",
            isCompleted ? "border-green-300 bg-green-50" : 
            isFailed ? "border-red-300 bg-red-50" : "border-gray-300"
          )}
        >
          {/* 目标位置指示器 */}
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full opacity-60"
            style={{ left: `${targetPosition}px` }}
          />
          
          {/* 滑块 */}
          <div
            ref={sliderRef}
            className={cn(
              "absolute top-1/2 transform -translate-y-1/2 w-10 h-8 rounded-lg cursor-pointer transition-all duration-200 select-none",
              "flex items-center justify-center text-white font-medium text-sm",
              isCompleted 
                ? "bg-green-500 shadow-lg" 
                : isFailed 
                ? "bg-red-500 shadow-lg" 
                : "bg-blue-500 hover:bg-blue-600 shadow-md",
              isDragging && "shadow-xl scale-105"
            )}
            style={{ left: `${sliderPosition}px` }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {isCompleted ? (
              <i className="fa-solid fa-check"></i>
            ) : isFailed ? (
              <i className="fa-solid fa-times"></i>
            ) : (
              <i className="fa-solid fa-arrows-left-right"></i>
            )}
          </div>
          
          {/* 成功/失败提示 */}
          {isCompleted && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-green-600 font-medium text-sm">
                验证成功
              </span>
            </div>
          )}
          
          {isFailed && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-red-600 font-medium text-sm">
                验证失败，请重试
              </span>
            </div>
          )}
        </div>
        
        {/* 提示文字 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isCompleted 
            ? "验证通过，可以继续操作" 
            : isFailed 
            ? "请将滑块拖到正确位置" 
            : "请将滑块拖到蓝色标记位置"
          }
        </div>
      </div>
    </div>
  );
}