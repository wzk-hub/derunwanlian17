import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  height: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
}

export function VirtualList<T>({
  items,
  height,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(height / itemHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    const startIndex = Math.max(0, start - overscan);
    
    return { start: startIndex, end };
  }, [scrollTop, itemHeight, height, overscan, items.length]);

  // 计算总高度和偏移量
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // 滚动到指定索引
  const scrollToIndex = useCallback((index: number) => {
    if (containerRef.current) {
      const scrollTop = index * itemHeight;
      containerRef.current.scrollTop = scrollTop;
    }
  }, [itemHeight]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  // 滚动到底部
  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);

  // 获取可见项
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div
              key={visibleRange.start + index}
              style={{ height: itemHeight }}
            >
              {renderItem(item, visibleRange.start + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 虚拟化表格组件
interface VirtualTableProps<T> {
  items: T[];
  height: number;
  rowHeight: number;
  columns: {
    key: string;
    header: string;
    width?: number | string;
    render?: (item: T, index: number) => React.ReactNode;
  }[];
  overscan?: number;
  className?: string;
  onRowClick?: (item: T, index: number) => void;
}

export function VirtualTable<T>({
  items,
  height,
  rowHeight,
  columns,
  overscan = 5,
  className = '',
  onRowClick
}: VirtualTableProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / rowHeight);
    const visibleCount = Math.ceil(height / rowHeight);
    const end = Math.min(start + visibleCount + overscan, items.length);
    const startIndex = Math.max(0, start - overscan);
    
    return { start: startIndex, end };
  }, [scrollTop, rowHeight, height, overscan, items.length]);

  // 计算总高度和偏移量
  const totalHeight = items.length * rowHeight;
  const offsetY = visibleRange.start * rowHeight;

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 获取可见项
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  return (
    <div className={`border border-gray-200 rounded-lg ${className}`}>
      {/* 表头 */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="flex">
          {columns.map((column) => (
            <div
              key={column.key}
              className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
            >
              {column.header}
            </div>
          ))}
        </div>
      </div>

      {/* 表体 */}
      <div
        ref={containerRef}
        className="overflow-auto"
        style={{ height: height - 48 }} // 减去表头高度
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map((item, index) => (
              <div
                key={visibleRange.start + index}
                className={`flex border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                  onRowClick ? 'hover:bg-gray-50' : ''
                }`}
                style={{ height: rowHeight }}
                onClick={() => onRowClick?.(item, visibleRange.start + index)}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="px-4 py-3 text-sm text-gray-900 flex items-center"
                    style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
                  >
                    {column.render
                      ? column.render(item, visibleRange.start + index)
                      : (item as any)[column.key]}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// 虚拟化网格组件
interface VirtualGridProps<T> {
  items: T[];
  height: number;
  itemWidth: number;
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  gap?: number;
}

export function VirtualGrid<T>({
  items,
  height,
  itemWidth,
  itemHeight,
  renderItem,
  overscan = 5,
  className = '',
  gap = 16
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // 计算每行能容纳的项目数
  const itemsPerRow = useMemo(() => {
    return Math.floor((containerRef.current?.clientWidth || window.innerWidth) / (itemWidth + gap));
  }, [itemWidth, gap]);

  // 计算可见范围
  const visibleRange = useMemo(() => {
    if (itemsPerRow === 0) return { start: 0, end: 0 };
    
    const rowHeight = itemHeight + gap;
    const startRow = Math.floor(scrollTop / rowHeight);
    const visibleRows = Math.ceil(height / rowHeight);
    const endRow = Math.min(startRow + visibleRows + overscan, Math.ceil(items.length / itemsPerRow));
    
    const startIndex = Math.max(0, startRow * itemsPerRow);
    const endIndex = Math.min(items.length, endRow * itemsPerRow);
    
    return { start: startIndex, end: endIndex };
  }, [scrollTop, itemHeight, gap, height, overscan, items.length, itemsPerRow]);

  // 计算总高度和偏移量
  const totalRows = Math.ceil(items.length / itemsPerRow);
  const totalHeight = totalRows * (itemHeight + gap) - gap;
  const offsetY = Math.floor(visibleRange.start / itemsPerRow) * (itemHeight + gap);

  // 处理滚动事件
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // 获取可见项
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange.start, visibleRange.end]);

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          <div
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow}, ${itemWidth}px)`,
              gap: `${gap}px`,
              padding: `${gap}px`
            }}
          >
            {visibleItems.map((item, index) => (
              <div
                key={visibleRange.start + index}
                style={{ width: itemWidth, height: itemHeight }}
              >
                {renderItem(item, visibleRange.start + index)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}