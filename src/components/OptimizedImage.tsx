import React, { useState, useEffect, useRef, useCallback } from 'react';
import { lazyLoadImage } from '@/utils/performance';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: string;
  fallback?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean; // 高优先级图片，不懒加载
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiM5QjlBQTAiLz4KPC9zdmc+',
  fallback = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjZCIi8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjRkY0NzQ3Ii8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiNGRjQ3NDciLz4KPC9zdmc+',
  loading = 'lazy',
  onLoad,
  onError,
  priority = false
}) => {
  const [imageSrc, setImageSrc] = useState<string>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 加载图片
  const loadImage = useCallback(() => {
    if (!src || hasError) return;

    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      setHasError(false);
      onLoad?.();
    };
    
    img.onerror = () => {
      setImageSrc(fallback);
      setHasError(true);
      setIsLoaded(false);
      onError?.();
    };
    
    img.src = src;
  }, [src, fallback, hasError, onLoad, onError]);

  // 设置懒加载观察器
  useEffect(() => {
    if (priority || loading === 'eager') {
      setIsInView(true);
      return;
    }

    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: '50px', // 提前50px开始加载
        threshold: 0.1
      }
    );

    observer.observe(imgRef.current);
    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [priority, loading]);

  // 当图片进入视口时开始加载
  useEffect(() => {
    if (isInView) {
      loadImage();
    }
  }, [isInView, loadImage]);

  // 清理观察器
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        }`}
        style={{ width, height }}
        loading={loading}
      />
      
      {/* 加载状态指示器 */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      
      {/* 错误状态指示器 */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50">
          <div className="text-center text-red-500">
            <i className="fa-solid fa-exclamation-triangle text-2xl mb-2"></i>
            <p className="text-sm">图片加载失败</p>
          </div>
        </div>
      )}
      
      {/* 渐进式加载遮罩 */}
      {isLoaded && (
        <div 
          className="absolute inset-0 bg-white opacity-0 transition-opacity duration-500"
          style={{ animation: 'fadeOut 0.5s ease-out' }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;