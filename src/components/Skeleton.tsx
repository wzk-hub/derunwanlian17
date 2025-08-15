import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = 'md',
  animate = true
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded',
    lg: 'rounded-lg',
    full: 'rounded-full'
  };
  const animateClasses = animate ? 'animate-pulse' : '';
  
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${roundedClasses[rounded]} ${animateClasses} ${className}`}
      style={style}
    />
  );
};

// 文本骨架屏
export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 1, className = '', lastLineWidth = '60%' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        className="h-4"
      />
    ))}
  </div>
);

// 头像骨架屏
export const SkeletonAvatar: React.FC<{
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };
  
  return (
    <Skeleton
      className={`${sizeClasses[size]} ${className}`}
      rounded="full"
    />
  );
};

// 卡片骨架屏
export const SkeletonCard: React.FC<{
  className?: string;
  showImage?: boolean;
  showActions?: boolean;
}> = ({ className = '', showImage = true, showActions = true }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
    {showImage && (
      <Skeleton className="w-full h-32 mb-4" />
    )}
    <SkeletonText lines={2} className="mb-3" />
    <SkeletonText lines={1} lastLineWidth="40%" />
    {showActions && (
      <div className="flex space-x-2 mt-4">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    )}
  </div>
);

// 表格行骨架屏
export const SkeletonTableRow: React.FC<{
  columns: number;
  className?: string;
}> = ({ columns, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, index) => (
      <td key={index} className="px-4 py-3">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// 列表项骨架屏
export const SkeletonListItem: React.FC<{
  className?: string;
  showAvatar?: boolean;
  showActions?: boolean;
}> = ({ className = '', showAvatar = true, showActions = true }) => (
  <div className={`flex items-center space-x-3 p-3 ${className}`}>
    {showAvatar && (
      <SkeletonAvatar size="md" />
    )}
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
    {showActions && (
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    )}
  </div>
);

// 表单骨架屏
export const SkeletonForm: React.FC<{
  fields?: number;
  className?: string;
}> = ({ fields = 4, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {Array.from({ length: fields }).map((_, index) => (
      <div key={index} className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    ))}
    <div className="pt-4">
      <Skeleton className="h-10 w-24" />
    </div>
  </div>
);