import React, { useState, useEffect, useCallback } from 'react';
import { getMemoryUsage, createPerformanceMarker } from '../utils/performance';

interface PerformanceMetrics {
  memoryUsage: {
    used: number;
    total: number;
    percentage: number;
  } | null;
  fps: number;
  loadTime: number;
  renderTime: number;
}

export const PerformanceMonitor: React.FC<{
  enabled?: boolean;
  className?: string;
}> = ({ enabled = false, className = '' }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    fps: 0,
    loadTime: 0,
    renderTime: 0
  });
  const [isVisible, setIsVisible] = useState(false);

  // 计算FPS
  const calculateFPS = useCallback(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    if (enabled) {
      countFrames();
    }
  }, [enabled]);

  // 监控内存使用
  const monitorMemory = useCallback(() => {
    const memoryUsage = getMemoryUsage();
    setMetrics(prev => ({ ...prev, memoryUsage }));
  }, []);

  // 监控页面加载时间
  const monitorLoadTime = useCallback(() => {
    if (performance.timing) {
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      setMetrics(prev => ({ ...prev, loadTime }));
    }
  }, []);

  // 监控渲染时间
  const monitorRenderTime = useCallback(() => {
    const marker = createPerformanceMarker('render');
    const end = marker.end;
    
    // 模拟渲染时间监控
    setTimeout(() => {
      const renderTime = end();
      setMetrics(prev => ({ ...prev, renderTime }));
    }, 100);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // 启动FPS监控
    calculateFPS();
    
    // 启动内存监控
    const memoryInterval = setInterval(monitorMemory, 2000);
    
    // 监控页面加载时间
    if (document.readyState === 'complete') {
      monitorLoadTime();
    } else {
      window.addEventListener('load', monitorLoadTime);
    }
    
    // 监控渲染时间
    monitorRenderTime();
    
    return () => {
      clearInterval(memoryInterval);
      window.removeEventListener('load', monitorLoadTime);
    };
  }, [enabled, calculateFPS, monitorMemory, monitorLoadTime, monitorRenderTime]);

  if (!enabled) return null;

  return (
    <>
      {/* 性能监控按钮 */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed bottom-4 right-4 z-50 p-2 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all ${className}`}
        title="性能监控"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </button>

      {/* 性能监控面板 */}
      {isVisible && (
        <div className="fixed bottom-20 right-4 z-50 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">性能监控</h3>
              <button
                onClick={() => setIsVisible(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {/* FPS */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">FPS:</span>
                <span className={`font-mono text-sm ${
                  metrics.fps >= 55 ? 'text-green-600' : 
                  metrics.fps >= 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {metrics.fps}
                </span>
              </div>

              {/* 内存使用 */}
              {metrics.memoryUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">内存使用:</span>
                    <span className="font-mono text-sm text-gray-800 dark:text-gray-200">
                      {(metrics.memoryUsage.used / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        metrics.memoryUsage.percentage < 70 ? 'bg-green-500' :
                        metrics.memoryUsage.percentage < 90 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(metrics.memoryUsage.percentage, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                    {metrics.memoryUsage.percentage.toFixed(1)}%
                  </div>
                </div>
              )}

              {/* 页面加载时间 */}
              {metrics.loadTime > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">页面加载:</span>
                  <span className={`font-mono text-sm ${
                    metrics.loadTime < 1000 ? 'text-green-600' :
                    metrics.loadTime < 3000 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.loadTime}ms
                  </span>
                </div>
              )}

              {/* 渲染时间 */}
              {metrics.renderTime > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">渲染时间:</span>
                  <span className={`font-mono text-sm ${
                    metrics.renderTime < 16 ? 'text-green-600' :
                    metrics.renderTime < 33 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metrics.renderTime}ms
                  </span>
                </div>
              )}
            </div>

            {/* 性能建议 */}
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">性能建议:</h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {metrics.fps < 30 && (
                  <li>• FPS过低，建议优化渲染性能</li>
                )}
                {metrics.memoryUsage && metrics.memoryUsage.percentage > 80 && (
                  <li>• 内存使用率过高，建议检查内存泄漏</li>
                )}
                {metrics.loadTime > 3000 && (
                  <li>• 页面加载时间过长，建议优化资源加载</li>
                )}
                {metrics.renderTime > 33 && (
                  <li>• 渲染时间过长，建议优化组件渲染</li>
                )}
                {metrics.fps >= 55 && metrics.memoryUsage && metrics.memoryUsage.percentage < 70 && (
                  <li>• 性能表现良好，继续保持</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 性能监控Hook
export const usePerformanceMonitor = (enabled = false) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    memoryUsage: null,
    fps: 0,
    loadTime: 0,
    renderTime: 0
  });

  const startMonitoring = useCallback(() => {
    if (!enabled) return;

    // 启动FPS监控
    let frameCount = 0;
    let lastTime = performance.now();
    
    const countFrames = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 1000) {
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        setMetrics(prev => ({ ...prev, fps }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      requestAnimationFrame(countFrames);
    };
    
    countFrames();
  }, [enabled]);

  const measureRenderTime = useCallback((name: string) => {
    if (!enabled) return () => {};
    
    const marker = createPerformanceMarker(name);
    return marker.end;
  }, [enabled]);

  const getMemoryInfo = useCallback(() => {
    if (!enabled) return null;
    
    const memoryUsage = getMemoryUsage();
    setMetrics(prev => ({ ...prev, memoryUsage }));
    return memoryUsage;
  }, [enabled]);

  return {
    metrics,
    startMonitoring,
    measureRenderTime,
    getMemoryInfo
  };
};