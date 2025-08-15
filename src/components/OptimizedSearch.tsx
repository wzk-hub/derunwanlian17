import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce, createDebouncedSearch, memoize } from '@/utils/performance';

interface SearchResult<T> {
  id: string | number;
  title: string;
  description?: string;
  data: T;
}

interface OptimizedSearchProps<T> {
  placeholder?: string;
  onSearch: (query: string) => Promise<T[]>;
  onResultSelect?: (result: T) => void;
  renderResult?: (result: SearchResult<T>) => React.ReactNode;
  minQueryLength?: number;
  debounceDelay?: number;
  maxResults?: number;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  cacheResults?: boolean;
  showClearButton?: boolean;
}

function OptimizedSearch<T>({
  placeholder = '搜索...',
  onSearch,
  onResultSelect,
  renderResult,
  minQueryLength = 2,
  debounceDelay = 300,
  maxResults = 10,
  className = '',
  disabled = false,
  loading = false,
  cacheResults = true,
  showClearButton = true
}: OptimizedSearchProps<T>) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);

  // 缓存搜索结果
  const searchCache = useMemo(() => new Map<string, T[]>(), []);

  // 创建防抖搜索函数
  const debouncedSearch = useMemo(() => {
    return createDebouncedSearch(onSearch, debounceDelay);
  }, [onSearch, debounceDelay]);

  // 处理搜索输入
  const handleSearchInput = useCallback(async (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);
    
    if (value.length < minQueryLength) {
      setResults([]);
      setShowResults(false);
      setError(null);
      return;
    }

    // 检查缓存
    if (cacheResults && searchCache.has(value)) {
      setResults(searchCache.get(value)!.slice(0, maxResults));
      setShowResults(true);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const searchResults = await debouncedSearch(value);
      
      if (searchResults.length > 0) {
        const limitedResults = searchResults.slice(0, maxResults);
        setResults(limitedResults);
        
        // 缓存结果
        if (cacheResults) {
          searchCache.set(value, searchResults);
        }
        
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (err) {
      setError('搜索失败，请重试');
      setResults([]);
      setShowResults(false);
    } finally {
      setIsSearching(false);
    }
  }, [minQueryLength, cacheResults, searchCache, maxResults, debouncedSearch]);

  // 防抖处理搜索输入
  const debouncedHandleSearch = useMemo(() => {
    return debounce(handleSearchInput, debounceDelay);
  }, [handleSearchInput, debounceDelay]);

  // 处理输入变化
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedHandleSearch(value);
  }, [debouncedHandleSearch]);

  // 处理键盘导航
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultSelect(results[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  }, [showResults, results, selectedIndex]);

  // 处理结果选择
  const handleResultSelect = useCallback((result: T) => {
    onResultSelect?.(result);
    setShowResults(false);
    setSelectedIndex(-1);
    setQuery('');
  }, [onResultSelect]);

  // 清空搜索
  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    setError(null);
  }, []);

  // 处理输入框焦点
  const handleInputFocus = useCallback(() => {
    if (results.length > 0) {
      setShowResults(true);
    }
  }, [results.length]);

  // 处理输入框失焦
  const handleInputBlur = useCallback(() => {
    // 延迟隐藏结果，以便点击结果
    setTimeout(() => {
      setShowResults(false);
      setSelectedIndex(-1);
    }, 200);
  }, []);

  // 默认结果渲染
  const defaultRenderResult = useCallback((result: SearchResult<T>) => (
    <div className="p-3 hover:bg-gray-50 cursor-pointer">
      <div className="font-medium text-gray-900">{result.title}</div>
      {result.description && (
        <div className="text-sm text-gray-600 mt-1">{result.description}</div>
      )}
    </div>
  ), []);

  // 渲染结果列表
  const renderResults = useMemo(() => {
    if (!showResults || results.length === 0) return null;

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
        {results.map((result, index) => {
          const searchResult: SearchResult<T> = {
            id: (result as any).id || index,
            title: (result as any).title || (result as any).name || String(result),
            description: (result as any).description,
            data: result
          };

          return (
            <div
              key={searchResult.id}
              className={`${
                index === selectedIndex ? 'bg-blue-50 border-blue-200' : ''
              } border-l-4 border-transparent hover:bg-gray-50 transition-colors`}
              onClick={() => handleResultSelect(result)}
            >
              {renderResult ? renderResult(searchResult) : defaultRenderResult(searchResult)}
            </div>
          );
        })}
      </div>
    );
  }, [showResults, results, selectedIndex, renderResult, defaultRenderResult, handleResultSelect]);

  return (
    <div className={`relative ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-2 pl-10 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        
        {/* 搜索图标 */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <i className="fa-solid fa-search"></i>
        </div>
        
        {/* 加载指示器 */}
        {isSearching && (
          <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* 清空按钮 */}
        {showClearButton && query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center">
          <i className="fa-solid fa-exclamation-circle mr-2"></i>
          {error}
        </div>
      )}

      {/* 搜索结果 */}
      {renderResults}

      {/* 搜索提示 */}
      {query.length > 0 && query.length < minQueryLength && (
        <div className="mt-2 text-sm text-gray-500">
          请输入至少 {minQueryLength} 个字符
        </div>
      )}
    </div>
  );
}

export default OptimizedSearch;