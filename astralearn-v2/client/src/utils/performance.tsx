// Performance optimization utilities and monitoring

import React, { lazy, ComponentType, useState, useEffect } from 'react';

// Lazy loading with error boundaries and loading states
export const createLazyComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: ComponentType
) => {
  const LazyComponent = lazy(importFunc);
  
  return LazyComponent;
};

// Code splitting for route-based components
export const LazyRoutes = {
  // Main pages
  Dashboard: createLazyComponent(() => import('../pages/Dashboard')),
  Courses: createLazyComponent(() => import('../pages/Courses')),
  CourseDetail: createLazyComponent(() => import('../pages/CourseDetail')),
  LearningInterface: createLazyComponent(() => import('../pages/LearningInterface')),
  
  // Enhanced UX pages
  EnhancedStudentDashboard: createLazyComponent(() => import('../components/EnhancedStudentDashboard')),
  InstructorDashboard: createLazyComponent(() => import('../pages/InstructorDashboard')),
  CourseEditor: createLazyComponent(() => import('../pages/CourseEditor')),
  AdvancedCourseSearch: createLazyComponent(() => import('../components/AdvancedCourseSearch')),
  
  // Phase 3 advanced features
  DiscussionForums: createLazyComponent(() => import('../pages/DiscussionForums')),
  ForumPostDetail: createLazyComponent(() => import('../pages/ForumPostDetail')),
  LearningAnalytics: createLazyComponent(() => import('../pages/LearningAnalytics')),
  RecommendationsPage: createLazyComponent(() => import('../pages/RecommendationsPage')),
  
  // Profile and settings
  Profile: createLazyComponent(() => import('../pages/Profile')),
  Settings: createLazyComponent(() => import('../pages/Settings')),
};

// Image optimization and lazy loading
export class ImageOptimizer {
  private static cache = new Map<string, string>();
  private static observer: IntersectionObserver | null = null;

  static initLazyLoading() {
    if (typeof window === 'undefined' || this.observer) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.classList.remove('lazy');
              this.observer?.unobserve(img);
            }
          }
        });
      },
      { rootMargin: '50px' }
    );
  }

  static lazyLoad(element: HTMLImageElement) {
    if (this.observer) {
      this.observer.observe(element);
    }
  }

  static optimizeImageUrl(url: string, width?: number, height?: number, quality = 80): string {
    const cacheKey = `${url}-${width}-${height}-${quality}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // In a real implementation, this would integrate with a CDN like Cloudinary or ImageKit
    let optimizedUrl = url;
    
    // Add query parameters for optimization
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    params.append('f', 'auto'); // Auto format selection
    
    if (params.toString()) {
      optimizedUrl += (url.includes('?') ? '&' : '?') + params.toString();
    }

    this.cache.set(cacheKey, optimizedUrl);
    return optimizedUrl;
  }
}

// Memory management and cleanup
export class MemoryManager {
  private static cleanupTasks: (() => void)[] = [];
  private static memoryThreshold = 50 * 1024 * 1024; // 50MB

  static addCleanupTask(task: () => void) {
    this.cleanupTasks.push(task);
  }

  static cleanup() {
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('Cleanup task failed:', error);
      }
    });
    this.cleanupTasks = [];
  }

  static monitorMemory() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > this.memoryThreshold) {
        console.warn('High memory usage detected, running cleanup');
        this.cleanup();
        
        // Force garbage collection if available
        if ('gc' in window) {
          (window as any).gc();
        }
      }
    }
  }

  static startMemoryMonitoring() {
    setInterval(() => {
      this.monitorMemory();
    }, 30000); // Check every 30 seconds
  }
}

// Performance monitoring and metrics
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  private static observers: PerformanceObserver[] = [];

  static init() {
    this.initNavigationTiming();
    this.initResourceTiming();
    this.initLongTaskTiming();
    this.initLayoutShiftTiming();
  }

  private static initNavigationTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            this.recordMetric('page-load-time', navEntry.loadEventEnd - navEntry.navigationStart);
            this.recordMetric('dom-content-loaded', navEntry.domContentLoadedEventEnd - navEntry.navigationStart);
            this.recordMetric('first-paint', navEntry.loadEventEnd - navEntry.navigationStart);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation'] });
      this.observers.push(observer);
    }
  }

  private static initResourceTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            this.recordMetric('resource-load-time', resourceEntry.responseEnd - resourceEntry.startTime);
            
            // Track specific resource types
            if (resourceEntry.name.includes('.js')) {
              this.recordMetric('js-load-time', resourceEntry.responseEnd - resourceEntry.startTime);
            } else if (resourceEntry.name.includes('.css')) {
              this.recordMetric('css-load-time', resourceEntry.responseEnd - resourceEntry.startTime);
            }
          }
        });
      });
      
      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    }
  }

  private static initLongTaskTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'longtask') {
            this.recordMetric('long-task-duration', entry.duration);
            console.warn(`Long task detected: ${entry.duration}ms`);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['longtask'] });
        this.observers.push(observer);
      } catch (e) {
        // Long task API not supported
      }
    }
  }

  private static initLayoutShiftTiming() {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.entryType === 'layout-shift' && !(entry as any).hadRecentInput) {
            this.recordMetric('cumulative-layout-shift', (entry as any).value);
          }
        });
      });
      
      try {
        observer.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(observer);
      } catch (e) {
        // Layout shift API not supported
      }
    }
  }

  static recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  static getMetrics() {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    this.metrics.forEach((values, name) => {
      if (values.length > 0) {
        result[name] = {
          avg: values.reduce((sum, val) => sum + val, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          count: values.length
        };
      }
    });
    
    return result;
  }

  static getPerformanceScore(): number {
    const metrics = this.getMetrics();
    let score = 100;
    
    // Deduct points based on performance metrics
    if (metrics['page-load-time']?.avg > 3000) score -= 20;
    if (metrics['long-task-duration']?.count > 0) score -= 15;
    if (metrics['cumulative-layout-shift']?.avg > 0.1) score -= 10;
    if (metrics['resource-load-time']?.avg > 1000) score -= 10;
    
    return Math.max(0, score);
  }

  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.metrics.clear();
  }
}

// Caching strategies
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private static maxSize = 100;

  static set(key: string, data: any, ttl = 300000) { // 5 minutes default TTL
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = Array.from(this.cache.keys())[0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  static clear() {
    this.cache.clear();
  }

  static cleanup() {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.cache.delete(key));
  }

  static startCleanupInterval() {
    setInterval(() => {
      this.cleanup();
    }, 60000); // Cleanup every minute
  }
}

// Bundle analysis and optimization
export class BundleOptimizer {
  static analyzeBundle() {
    if (process.env.NODE_ENV === 'development') {
      // In development, we can analyze the bundle
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      console.group('Bundle Analysis');
      console.log('JavaScript files:', scripts.length);
      console.log('CSS files:', styles.length);
      
      // Calculate total bundle size (approximate)
      let totalSize = 0;
      scripts.forEach(script => {
        const src = (script as HTMLScriptElement).src;
        if (src.includes('chunk') || src.includes('bundle')) {
          // Estimate size based on filename patterns
          totalSize += 100; // KB estimate
        }
      });
      
      console.log('Estimated bundle size:', totalSize, 'KB');
      console.groupEnd();
    }
  }

  static preloadCriticalResources() {
    // Preload critical fonts
    const criticalFonts = [
      '/fonts/inter-var.woff2',
      '/fonts/inter-var-italic.woff2'
    ];
    
    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/images/hero-bg.webp',
      '/images/logo.svg'
    ];
    
    criticalImages.forEach(image => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = image;
      link.as = 'image';
      document.head.appendChild(link);
    });
  }
}

// Virtual scrolling for large lists
export class VirtualScrollManager {
  private container: HTMLElement;
  private itemHeight: number;
  private visibleCount: number;
  private totalCount: number;
  private scrollTop = 0;
  private renderCallback: (startIndex: number, endIndex: number) => void;

  constructor(
    container: HTMLElement,
    itemHeight: number,
    totalCount: number,
    renderCallback: (startIndex: number, endIndex: number) => void
  ) {
    this.container = container;
    this.itemHeight = itemHeight;
    this.totalCount = totalCount;
    this.renderCallback = renderCallback;
    this.visibleCount = Math.ceil(container.clientHeight / itemHeight) + 2; // Buffer

    this.init();
  }

  private init() {
    this.container.addEventListener('scroll', this.handleScroll.bind(this));
    this.update();
  }

  private handleScroll() {
    this.scrollTop = this.container.scrollTop;
    this.update();
  }

  private update() {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const endIndex = Math.min(startIndex + this.visibleCount, this.totalCount);
    
    this.renderCallback(startIndex, endIndex);
  }

  updateTotalCount(count: number) {
    this.totalCount = count;
    this.update();
  }

  scrollToIndex(index: number) {
    this.container.scrollTop = index * this.itemHeight;
  }

  destroy() {
    this.container.removeEventListener('scroll', this.handleScroll.bind(this));
  }
}

// Performance dashboard component
export const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(PerformanceMonitor.getMetrics());
    };

    const interval = setInterval(updateMetrics, 5000);
    updateMetrics();

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-full shadow-lg z-50"
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border shadow-lg rounded-lg p-4 max-w-sm z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Performance</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Score:</span>
          <span className={`font-medium ${
            PerformanceMonitor.getPerformanceScore() > 80 ? 'text-green-600' :
            PerformanceMonitor.getPerformanceScore() > 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {PerformanceMonitor.getPerformanceScore()}/100
          </span>
        </div>

        {Object.entries(metrics).map(([key, value]: [string, any]) => (
          <div key={key} className="flex justify-between">
            <span className="capitalize">{key.replace(/-/g, ' ')}:</span>
            <span>{Math.round(value.avg)}ms</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Initialize all performance optimizations
export const initializePerformanceOptimizations = () => {
  // Initialize image lazy loading
  ImageOptimizer.initLazyLoading();

  // Start performance monitoring
  PerformanceMonitor.init();

  // Start memory monitoring
  MemoryManager.startMemoryMonitoring();

  // Start cache cleanup
  CacheManager.startCleanupInterval();

  // Preload critical resources
  BundleOptimizer.preloadCriticalResources();

  // Analyze bundle in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      BundleOptimizer.analyzeBundle();
    }, 2000);
  }

  console.log('Performance optimizations initialized');
};

// Cleanup function for when the app unmounts
export const cleanupPerformanceOptimizations = () => {
  PerformanceMonitor.cleanup();
  MemoryManager.cleanup();
  CacheManager.clear();
};
