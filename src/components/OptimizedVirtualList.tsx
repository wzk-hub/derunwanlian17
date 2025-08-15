import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { createVirtualScroller } from '@/utils/performance';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  estimatedItemHeight?: number;
  dynamicHeight?: boolean; // 是否支持动态高度
}

function OptimizedVirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  estimatedItemHeight,
  dynamicHeight = false
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);
  const itemHeightsRef = useRef<Map<number, number>>(new Map());
  const observerRef = useRef<ResizeObserver | null>(null);

  // 创建虚拟滚动器
  const virtualScroller = useMemo(() => {
    const effectiveItemHeight = dynamicHeight ? (estimatedItemHeight || itemHeight) : itemHeight;
    return createVirtualScroller(items, effectiveItemHeight, containerHeight, overscan);
  }, [items, itemHeight, containerHeight, overscan, dynamicHeight, estimatedItemHeight]);

  // 获取可见范围
  const visibleRange = useMemo(() => {
    return virtualScroller.getVisibleRange(scrollTop);
  }, [virtualScroller, scrollTop]);

  // 计算总高度
  const totalHeight = useMemo(() => {
    if (dynamicHeight) {
      let height = 0;
      for (let i = 0; i < items.length; i++) {
        height += itemHeightsRef.current.get(i) || estimatedItemHeight || itemHeight;
      }
      return height;
    }
    return virtualScroller.totalHeight;
  }, [items.length, dynamicHeight, estimatedItemHeight, itemHeight, virtualScroller.totalHeight]);

  // 处理滚动事件
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    setScrollTop(scrollTop);
    onScroll?.(scrollTop);
  }, [onScroll]);

  // 设置容器引用
  const setContainerRefCallback = useCallback((node: HTMLDivElement | null) => {
    setContainerRef(node);
    
    if (node && dynamicHeight) {
      // 设置 ResizeObserver 监听子元素高度变化
      observerRef.current = new ResizeObserver((entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          const height = entry.contentRect.height;
          itemHeightsRef.current.set(index, height);
        });
      });
    }
  }, [dynamicHeight]);

  // 清理观察器
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // 渲染可见项目
  const visibleItems = useMemo(() => {
    const { startIndex, endIndex, offsetY } = visibleRange;
    const itemsToRender = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      if (i >= 0 && i < items.length) {
        const item = items[i];
        const itemTop = dynamicHeight 
          ? Array.from({ length: i }, (_, index) => 
              itemHeightsRef.current.get(index) || estimatedItemHeight || itemHeight
            ).reduce((sum, height) => sum + height, 0)
          : i * itemHeight;
        
        itemsToRender.push(
          <div
            key={i}
            data-index={i}
            className="absolute left-0 right-0"
            style={{
              top: itemTop,
              height: dynamicHeight ? (estimatedItemHeight || itemHeight) : itemHeight,
              transform: `translateY(${offsetY}px)`
            }}
          >
            {renderItem(item, i)}
          </div>
        );
      }
    }
    
    return itemsToRender;
  }, [visibleRange, items, renderItem, dynamicHeight, estimatedItemHeight, itemHeight]);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number, align: 'start' | 'center' | 'end' = 'start') => {
    if (!scrollElementRef.current) return;
    
    let targetScrollTop = 0;
    
    if (dynamicHeight) {
      // 计算动态高度下的滚动位置
      for (let i = 0; i < index; i++) {
        targetScrollTop += itemHeightsRef.current.get(i) || estimatedItemHeight || itemHeight;
      }
    } else {
      targetScrollTop = index * itemHeight;
    }
    
    // 根据对齐方式调整滚动位置
    if (align === 'center') {
      targetScrollTop -= containerHeight / 2;
    } else if (align === 'end') {
      targetScrollTop -= containerHeight;
    }
    
    targetScrollTop = Math.max(0, targetScrollTop);
    
    scrollElementRef.current.scrollTop = targetScrollTop;
  }, [dynamicHeight, estimatedItemHeight, itemHeight, containerHeight]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1, 'end');
  }, [scrollToIndex, items.length]);

  return (
    <div className={`relative ${className}`} style={{ height: containerHeight }}>
      {/* 滚动容器 */}
      <div
        ref={setContainerRefCallback}
        className="h-full overflow-auto"
        onScroll={handleScroll}
        style={{
          height: containerHeight,
          position: 'relative'
        }}
      >
        {/* 内容容器 */}
        <div
          ref={scrollElementRef}
          style={{
            height: totalHeight,
            position: 'relative'
          }}
        >
          {visibleItems}
        </div>
      </div>
      
      {/* 滚动条样式优化 */}
      <style jsx>{`
        .overflow-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 4px;
        }
        .overflow-auto::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default OptimizedVirtualList;