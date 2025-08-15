import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Skeleton } from './Skeleton';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  placeholder?: React.ReactNode;
  fallback?: string;
  onLoad?: () => void;
  onError?: () => void;
  threshold?: number;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholder,
  fallback = '/placeholder-image.png',
  onLoad,
  onError,
  threshold = 0.1,
  rootMargin = '50px'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // 默认占位符
  const defaultPlaceholder = (
    <Skeleton 
      className={`${className} ${width ? `w-${width}` : 'w-full'} ${height ? `h-${height}` : 'h-32'}`}
      animate={true}
    />
  );

  // 处理图片加载
  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  // 处理图片错误
  const handleImageError = useCallback(() => {
    setHasError(true);
    setImageSrc(fallback);
    onError?.();
  }, [fallback, onError]);

  // 设置交叉观察器
  useEffect(() => {
    if (!imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        threshold,
        rootMargin
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // 当图片进入视口时开始加载
  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  // 图片样式
  const imageStyle: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : 'auto',
    height: height ? (typeof height === 'number' ? `${height}px` : height) : 'auto',
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out'
  };

  // 如果图片还未进入视口，显示占位符
  if (!isInView) {
    return (
      <div className={className} style={{ width, height }}>
        {placeholder || defaultPlaceholder}
      </div>
    );
  }

  // 如果图片正在加载，显示占位符
  if (!isLoaded && !hasError) {
    return (
      <div className={className} style={{ width, height }}>
        {placeholder || defaultPlaceholder}
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className="hidden"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    );
  }

  // 图片加载完成或出错
  return (
    <div className={className} style={{ width, height }}>
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={className}
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};

// 头像懒加载组件
export const LazyAvatar: React.FC<{
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  fallback?: string;
}> = ({ src, alt, size = 'md', className = '', fallback }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const defaultFallback = (
    <div className={`${sizeClasses[size]} bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm font-medium`}>
      {alt.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      placeholder={<Skeleton className={`${sizeClasses[size]} rounded-full`} />}
      fallback={fallback}
    />
  );
};

// 卡片图片懒加载组件
export const LazyCardImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'wide';
  fallback?: string;
}> = ({ src, alt, className = '', aspectRatio = 'video', fallback }) => {
  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    wide: 'aspect-[16/9]'
  };

  return (
    <LazyImage
      src={src}
      alt={alt}
      className={`w-full object-cover ${aspectClasses[aspectRatio]} ${className}`}
      placeholder={<Skeleton className={`w-full ${aspectClasses[aspectRatio]}`} />}
      fallback={fallback}
    />
  );
};