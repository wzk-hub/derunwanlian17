/**
 * 性能优化配置文件
 */

export interface PerformanceConfig {
  // 图片懒加载配置
  lazyLoading: {
    enabled: boolean;
    threshold: number;
    rootMargin: string;
    placeholder: string;
    fallback: string;
  };
  
  // 虚拟滚动配置
  virtualScrolling: {
    enabled: boolean;
    itemHeight: number;
    overscan: number;
    maxItems: number;
  };
  
  // 搜索优化配置
  search: {
    debounceDelay: number;
    minQueryLength: number;
    maxResults: number;
    cacheEnabled: boolean;
    cacheSize: number;
  };
  
  // 缓存配置
  caching: {
    enabled: boolean;
    maxSize: number;
    ttl: number; // 缓存生存时间（毫秒）
  };
  
  // 性能监控配置
  monitoring: {
    enabled: boolean;
    metrics: {
      fps: boolean;
      memory: boolean;
      loadTime: boolean;
      renderTime: boolean;
    };
    interval: number; // 监控间隔（毫秒）
  };
  
  // 预加载配置
  preloading: {
    enabled: boolean;
    criticalResources: string[];
    prefetchOnHover: boolean;
  };
  
  // 动画配置
  animations: {
    enabled: boolean;
    reducedMotion: boolean;
    hardwareAcceleration: boolean;
  };
  
  // 移动端优化配置
  mobile: {
    touchOptimization: boolean;
    scrollOptimization: boolean;
    imageCompression: boolean;
  };
}

// 默认性能配置
export const defaultPerformanceConfig: PerformanceConfig = {
  lazyLoading: {
    enabled: true,
    threshold: 0.1,
    rootMargin: '50px',
    placeholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiM5QjlBQTAiLz4KPC9zdmc+',
    fallback: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjZCIi8+CjxwYXRoIGQ9Ik0xMDAgMTEwQzExMC40NTcgMTEwIDExOSAxMDEuNDU3IDExOSA5MUMxMTkgODAuNTQzIDExMC40NTcgNzIgMTAwIDcyQzg5LjU0MyA3MiA4MSA4MC41NDMgODEgOTFDODEgMTAxLjQ1NyA4OS41NDMgMTEwIDEwMCAxMTBaIiBmaWxsPSIjRkY0NzQ3Ii8+CjxwYXRoIGQ9Ik0xMDAgMTI4QzExMC40NTcgMTI4IDExOSAxMTkuNDU3IDExOSAxMDlDMTE5IDk4LjU0MyAxMTAuNDU3IDkwIDEwMCA5MEM4OS41NDMgOTAgODEgOTguNTQzIDgxIDEwOUM4MSAxMTkuNDU3IDg5LjU0MyAxMjggMTAwIDEyOFoiIGZpbGw9IiNGRjQ3NDciLz4KPC9zdmc+'
  },
  
  virtualScrolling: {
    enabled: true,
    itemHeight: 60,
    overscan: 5,
    maxItems: 10000
  },
  
  search: {
    debounceDelay: 300,
    minQueryLength: 2,
    maxResults: 10,
    cacheEnabled: true,
    cacheSize: 100
  },
  
  caching: {
    enabled: true,
    maxSize: 100,
    ttl: 5 * 60 * 1000 // 5分钟
  },
  
  monitoring: {
    enabled: process.env.NODE_ENV === 'development',
    metrics: {
      fps: true,
      memory: true,
      loadTime: true,
      renderTime: true
    },
    interval: 2000
  },
  
  preloading: {
    enabled: true,
    criticalResources: [
      '/favicon.ico',
      '/logo.png'
    ],
    prefetchOnHover: true
  },
  
  animations: {
    enabled: true,
    reducedMotion: true,
    hardwareAcceleration: true
  },
  
  mobile: {
    touchOptimization: true,
    scrollOptimization: true,
    imageCompression: true
  }
};

// 性能配置管理类
export class PerformanceConfigManager {
  private config: PerformanceConfig;
  private listeners: Set<(config: PerformanceConfig) => void> = new Set();

  constructor(initialConfig: PerformanceConfig = defaultPerformanceConfig) {
    this.config = { ...initialConfig };
    this.loadFromStorage();
  }

  // 获取配置
  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  // 更新配置
  updateConfig(updates: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveToStorage();
    this.notifyListeners();
  }

  // 重置配置
  resetConfig(): void {
    this.config = { ...defaultPerformanceConfig };
    this.saveToStorage();
    this.notifyListeners();
  }

  // 添加配置变化监听器
  addListener(listener: (config: PerformanceConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // 通知监听器
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }

  // 从本地存储加载配置
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem('performance-config');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.config = { ...defaultPerformanceConfig, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load performance config from storage:', error);
    }
  }

  // 保存配置到本地存储
  private saveToStorage(): void {
    try {
      localStorage.setItem('performance-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save performance config to storage:', error);
    }
  }

  // 检查特定功能是否启用
  isFeatureEnabled(feature: keyof PerformanceConfig): boolean {
    return this.config[feature]?.enabled ?? false;
  }

  // 获取特定配置项
  getFeatureConfig<K extends keyof PerformanceConfig>(feature: K): PerformanceConfig[K] {
    return this.config[feature];
  }
}

// 导出单例实例
export const performanceConfigManager = new PerformanceConfigManager();

// 性能优化工具函数
export const performanceUtils = {
  // 检查设备性能
  checkDevicePerformance(): 'low' | 'medium' | 'high' {
    const memory = (performance as any).memory;
    const cores = navigator.hardwareConcurrency || 1;
    
    if (memory) {
      const memoryGB = memory.totalJSHeapSize / (1024 * 1024 * 1024);
      if (memoryGB < 2 || cores < 4) return 'low';
      if (memoryGB < 8 || cores < 8) return 'medium';
      return 'high';
    }
    
    // 基于核心数判断
    if (cores < 4) return 'low';
    if (cores < 8) return 'medium';
    return 'high';
  },

  // 检查网络状况
  checkNetworkCondition(): 'slow' | 'medium' | 'fast' {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        return 'slow';
      }
      if (connection.effectiveType === '3g') {
        return 'medium';
      }
      return 'fast';
    }
    return 'medium';
  },

  // 根据设备性能调整配置
  adjustConfigForDevice(): void {
    const performance = this.checkDevicePerformance();
    const network = this.checkNetworkCondition();
    
    let updates: Partial<PerformanceConfig> = {};
    
    if (performance === 'low') {
      updates = {
        lazyLoading: { ...defaultPerformanceConfig.lazyLoading, threshold: 0.05 },
        virtualScrolling: { ...defaultPerformanceConfig.virtualScrolling, overscan: 3 },
        animations: { ...defaultPerformanceConfig.animations, enabled: false },
        preloading: { ...defaultPerformanceConfig.preloading, enabled: false }
      };
    }
    
    if (network === 'slow') {
      updates = {
        ...updates,
        lazyLoading: { ...defaultPerformanceConfig.lazyLoading, rootMargin: '100px' },
        preloading: { ...defaultPerformanceConfig.preloading, enabled: false },
        caching: { ...defaultPerformanceConfig.caching, ttl: 10 * 60 * 1000 } // 10分钟
      };
    }
    
    if (Object.keys(updates).length > 0) {
      performanceConfigManager.updateConfig(updates);
    }
  }
};

// 自动调整配置
if (typeof window !== 'undefined') {
  // 等待页面加载完成后调整配置
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceUtils.adjustConfigForDevice();
    });
  } else {
    performanceUtils.adjustConfigForDevice();
  }
}