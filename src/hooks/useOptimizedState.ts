import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * 优化的状态管理Hook，减少不必要的重渲染
 */
export function useOptimizedState<T>(initialValue: T) {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef<T>(state);
  
  // 更新状态引用
  useEffect(() => {
    stateRef.current = state;
  }, [state]);
  
  // 优化的状态更新函数
  const setOptimizedState = useCallback((newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === 'function') {
      const updater = newValue as (prev: T) => T;
      setState(prev => {
        const next = updater(prev);
        // 只有在值真正改变时才更新
        if (next !== prev) {
          return next;
        }
        return prev;
      });
    } else {
      // 直接值更新，检查是否真的改变了
      if (newValue !== stateRef.current) {
        setState(newValue);
      }
    }
  }, []);
  
  return [state, setOptimizedState, stateRef] as const;
}

/**
 * 防抖状态Hook
 */
export function useDebouncedState<T>(
  initialValue: T,
  delay: number = 300
) {
  const [state, setState] = useState<T>(initialValue);
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const setDebouncedState = useCallback((newValue: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setState(newValue);
    }, delay);
  }, [delay]);
  
  // 清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return [state, setDebouncedState] as const;
}

/**
 * 节流状态Hook
 */
export function useThrottledState<T>(
  initialValue: T,
  limit: number = 100
) {
  const [state, setState] = useState<T>(initialValue);
  const lastUpdateRef = useRef<number>(0);
  
  const setThrottledState = useCallback((newValue: T) => {
    const now = Date.now();
    
    if (now - lastUpdateRef.current >= limit) {
      setState(newValue);
      lastUpdateRef.current = now;
    }
  }, [limit]);
  
  return [state, setThrottledState] as const;
}

/**
 * 异步状态Hook
 */
export function useAsyncState<T>(
  initialValue: T,
  asyncUpdater: (current: T) => Promise<T>
) {
  const [state, setState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const updateAsync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newValue = await asyncUpdater(state);
      setState(newValue);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [state, asyncUpdater]);
  
  return [state, updateAsync, isLoading, error] as const;
}

/**
 * 本地存储状态Hook
 */
export function useLocalStorageState<T>(
  key: string,
  initialValue: T,
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  }
) {
  const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  };
  
  const { serialize, deserialize } = serializer || defaultSerializer;
  
  // 获取初始值
  const getInitialValue = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserialize]);
  
  const [state, setState] = useState<T>(getInitialValue);
  
  // 更新状态和本地存储
  const setLocalStorageState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      
      try {
        window.localStorage.setItem(key, serialize(next));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
      
      return next;
    });
  }, [key, serialize]);
  
  // 监听其他标签页的存储变化
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = deserialize(e.newValue);
          setState(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, deserialize]);
  
  return [state, setLocalStorageState] as const;
}

/**
 * 会话存储状态Hook
 */
export function useSessionStorageState<T>(
  key: string,
  initialValue: T,
  serializer?: {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
  }
) {
  const defaultSerializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse
  };
  
  const { serialize, deserialize } = serializer || defaultSerializer;
  
  // 获取初始值
  const getInitialValue = useCallback((): T => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue, deserialize]);
  
  const [state, setState] = useState<T>(getInitialValue);
  
  // 更新状态和会话存储
  const setSessionStorageState = useCallback((newValue: T | ((prev: T) => T)) => {
    setState(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue;
      
      try {
        window.sessionStorage.setItem(key, serialize(next));
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
      
      return next;
    });
  }, [key, serialize]);
  
  return [state, setSessionStorageState] as const;
}