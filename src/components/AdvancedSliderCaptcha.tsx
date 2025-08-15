import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';

interface AdvancedSliderCaptchaProps {
  onSuccess: () => void;
  onFail: () => void;
  disabled?: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface DragData {
  startTime: number;
  endTime: number;
  startX: number;
  endX: number;
  path: Array<{ x: number; y: number; time: number }>;
  velocity: number[];
}

export default function AdvancedSliderCaptcha({ 
  onSuccess, 
  onFail, 
  disabled = false,
  difficulty = 'medium' 
}: AdvancedSliderCaptchaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [targetPosition, setTargetPosition] = useState(0);
  const [showTarget, setShowTarget] = useState(false);
  const [dragData, setDragData] = useState<DragData | null>(null);
  const [isHuman, setIsHuman] = useState(true);
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const sliderStartXRef = useRef(0);
  const dragStartTimeRef = useRef(0);
  const pathRef = useRef<Array<{ x: number; y: number; time: number }>>([]);

  // 根据难度设置参数
  const getDifficultyConfig = () => {
    switch (difficulty) {
      case 'easy':
        return { tolerance: 8, minTime: 200, maxTime: 5000, minPathPoints: 3 };
      case 'hard':
        return { tolerance: 3, minTime: 500, maxTime: 3000, minPathPoints: 8 };
      default: // medium
        return { tolerance: 5, minTime: 300, maxTime: 4000, minPathPoints: 5 };
    }
  };

  const config = getDifficultyConfig();

  // 生成随机目标位置
  useEffect(() => {
    if (trackRef.current) {
      const trackWidth = trackRef.current.offsetWidth;
      const sliderWidth = 40;
      const maxPosition = trackWidth - sliderWidth;
      const randomPosition = Math.floor(Math.random() * (maxPosition - 80)) + 40;
      setTargetPosition(randomPosition);
    }
  }, [attempts]);

  // 重置验证
  const resetCaptcha = useCallback(() => {
    setSliderPosition(0);
    setIsCompleted(false);
    setIsFailed(false);
    setIsDragging(false);
    setShowTarget(false);
    setDragData(null);
    setIsHuman(true);
    pathRef.current = [];
  }, []);

  // 检测是否为机器人
  const detectBot = useCallback((data: DragData): boolean => {
    const { startTime, endTime, path, velocity } = data;
    const duration = endTime - startTime;
    const distance = Math.abs(data.endX - data.startX);
    
    // 检测1: 时间异常（太快或太慢）
    if (duration < config.minTime || duration > config.maxTime) {
      return true;
    }
    
    // 检测2: 路径点太少（机器人通常路径简单）
    if (path.length < config.minPathPoints) {
      return true;
    }
    
    // 检测3: 速度异常（机器人通常速度恒定）
    const avgVelocity = velocity.reduce((a, b) => a + b, 0) / velocity.length;
    const velocityVariance = velocity.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / velocity.length;
    
    if (velocityVariance < 0.1) { // 速度变化太小，可能是机器人
      return true;
    }
    
    // 检测4: 路径过于直线（机器人通常走直线）
    let totalDistance = 0;
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i-1].x;
      const dy = path[i].y - path[i-1].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    
    const straightLineDistance = Math.sqrt(
      Math.pow(path[path.length - 1].x - path[0].x, 2) + 
      Math.pow(path[path.length - 1].y - path[0].y, 2)
    );
    
    if (totalDistance / straightLineDistance < 1.1) { // 路径过于直线
      return true;
    }
    
    // 检测5: 时间间隔异常（机器人通常时间间隔恒定）
    const timeIntervals = [];
    for (let i = 1; i < path.length; i++) {
      timeIntervals.push(path[i].time - path[i-1].time);
    }
    
    const avgInterval = timeIntervals.reduce((a, b) => a + b, 0) / timeIntervals.length;
    const intervalVariance = timeIntervals.reduce((sum, t) => sum + Math.pow(t - avgInterval, 2), 0) / timeIntervals.length;
    
    if (intervalVariance < 10) { // 时间间隔变化太小
      return true;
    }
    
    return false;
  }, [config]);

  // 处理鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    if (disabled || isCompleted) return;
    
    e.preventDefault();
    setIsDragging(true);
    setShowTarget(true);
    startXRef.current = e.clientX;
    sliderStartXRef.current = sliderPosition;
    dragStartTimeRef.current = Date.now();
    pathRef.current = [{ x: e.clientX, y: e.clientY, time: Date.now() }];
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // 处理触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled || isCompleted) return;
    
    setIsDragging(true);
    setShowTarget(true);
    startXRef.current = e.touches[0].clientX;
    sliderStartXRef.current = sliderPosition;
    dragStartTimeRef.current = Date.now();
    pathRef.current = [{ x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() }];
  };

  // 处理鼠标移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(sliderStartXRef.current + deltaX, 
      (trackRef.current?.offsetWidth || 0) - 40));
    
    setSliderPosition(newPosition);
    
    // 记录路径
    pathRef.current.push({ x: e.clientX, y: e.clientY, time: Date.now() });
  }, [isDragging]);

  // 处理触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    const deltaX = e.touches[0].clientX - startXRef.current;
    const newPosition = Math.max(0, Math.min(sliderStartXRef.current + deltaX, 
      (trackRef.current?.offsetWidth || 0) - 40));
    
    setSliderPosition(newPosition);
    
    // 记录路径
    pathRef.current.push({ x: e.touches[0].clientX, y: e.touches[0].clientY, time: Date.now() });
  };

  // 处理鼠标释放
  const handleMouseUp = useCallback(() => {
    if (!isDragging) return;
    
    const endTime = Date.now();
    const endX = sliderPosition;
    
    // 计算速度
    const velocity = [];
    for (let i = 1; i < pathRef.current.length; i++) {
      const timeDiff = pathRef.current[i].time - pathRef.current[i-1].time;
      const distance = Math.sqrt(
        Math.pow(pathRef.current[i].x - pathRef.current[i-1].x, 2) + 
        Math.pow(pathRef.current[i].y - pathRef.current[i-1].y, 2)
      );
      velocity.push(distance / timeDiff);
    }
    
    const dragData: DragData = {
      startTime: dragStartTimeRef.current,
      endTime,
      startX: sliderStartXRef.current,
      endX,
      path: [...pathRef.current],
      velocity
    };
    
    setDragData(dragData);
    
    // 检测机器人
    const isBot = detectBot(dragData);
    setIsHuman(!isBot);
    
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    
    checkPosition(isBot);
  }, [isDragging, sliderPosition, detectBot]);

  // 处理触摸结束
  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    const endTime = Date.now();
    const endX = sliderPosition;
    
    // 计算速度
    const velocity = [];
    for (let i = 1; i < pathRef.current.length; i++) {
      const timeDiff = pathRef.current[i].time - pathRef.current[i-1].time;
      const distance = Math.sqrt(
        Math.pow(pathRef.current[i].x - pathRef.current[i-1].x, 2) + 
        Math.pow(pathRef.current[i].y - pathRef.current[i-1].y, 2)
      );
      velocity.push(distance / timeDiff);
    }
    
    const dragData: DragData = {
      startTime: dragStartTimeRef.current,
      endTime,
      startX: sliderStartXRef.current,
      endX,
      path: [...pathRef.current],
      velocity
    };
    
    setDragData(dragData);
    
    // 检测机器人
    const isBot = detectBot(dragData);
    setIsHuman(!isBot);
    
    setIsDragging(false);
    checkPosition(isBot);
  };

  // 检查位置是否正确
  const checkPosition = (isBot: boolean) => {
    const isCorrect = Math.abs(sliderPosition - targetPosition) <= config.tolerance;
    
    if (isCorrect && !isBot) {
      setIsCompleted(true);
      onSuccess();
    } else {
      setIsFailed(true);
      setAttempts(prev => prev + 1);
      onFail();
      
      // 自动重置
      setTimeout(() => {
        resetCaptcha();
      }, 1500);
    }
  };

  // 清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

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
          {showTarget && (
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full opacity-60"
              style={{ left: `${targetPosition}px` }}
            />
          )}
          
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
                {!isHuman ? "检测到异常操作，请重试" : "请将滑块拖到正确位置"}
              </span>
            </div>
          )}
        </div>
        
        {/* 提示文字 */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {isCompleted 
            ? "验证通过，可以继续操作" 
            : isFailed 
            ? (!isHuman ? "检测到机器人行为，请重试" : "请将滑块拖到蓝色标记位置")
            : "请将滑块拖到蓝色标记位置"
          }
        </div>
        
        {/* 难度指示 */}
        <div className="mt-1 text-xs text-gray-400 text-center">
          难度: {difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}
        </div>
      </div>
    </div>
  );
}