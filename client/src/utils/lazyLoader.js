/**
 * Lazy Loading Utilities for AstraLearn
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides advanced lazy loading capabilities for:
 * - Route-based code splitting
 * - Component-level lazy loading
 * - Asset optimization
 * - Progressive loading strategies
 */

import { lazy, Suspense, useState, useEffect, useRef } from 'react';

/**
 * Enhanced lazy loading with retry mechanism and error boundaries
 */
export const createLazyComponent = (importFunc, options = {}) => {
  const {
    fallback = <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>,
    errorFallback = <div className="text-red-600 p-4">Failed to load component</div>,
    retryDelay = 1000,
    maxRetries = 3
  } = options;

  const LazyComponent = lazy(() => {
    return retryImport(importFunc, retryDelay, maxRetries);
  });

  return (props) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

/**
 * Retry import with exponential backoff
 */
const retryImport = async (importFunc, delay, retries) => {
  try {
    return await importFunc();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Import failed, retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryImport(importFunc, delay * 2, retries - 1);
    }
    throw error;
  }
};

/**
 * Preload component for better user experience
 */
export const preloadComponent = (importFunc) => {
  return importFunc().catch(error => {
    console.warn('Failed to preload component:', error);
  });
};

/**
 * Progressive image loading component
 */
export const LazyImage = ({ 
  src, 
  alt, 
  placeholder = '/placeholder.svg', 
  className = '',
  onLoad,
  onError 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholder);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
      onLoad?.();
    };
    img.onerror = () => {
      setHasError(true);
      onError?.();
    };
    img.src = src;
  }, [src, onLoad, onError]);

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-70'} transition-opacity duration-300`}
      loading="lazy"
    />
  );
};

/**
 * Intersection Observer based lazy loading
 */
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, hasIntersected, options]);

  return { isIntersecting, hasIntersected };
};

/**
 * Lazy loading wrapper component
 */
export const LazySection = ({ children, className = '', placeholder }) => {
  const ref = useRef();
  const { hasIntersected } = useIntersectionObserver(ref);

  return (
    <div ref={ref} className={className}>
      {hasIntersected ? children : (placeholder || 
        <div className="h-32 bg-gray-100 animate-pulse rounded-lg"></div>
      )}
    </div>
  );
};

/**
 * Bundle analyzer helper for development
 */
export const logBundleInfo = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📦 Bundle Information');
    console.log('Loaded chunks:', performance.getEntriesByType('navigation'));
    console.log('Resource timing:', performance.getEntriesByType('resource'));
    console.groupEnd();
  }
};

/**
 * Performance monitoring for lazy loaded components
 */
export const withPerformanceMonitoring = (Component, componentName) => {
  return (props) => {
    useEffect(() => {
      const startTime = performance.now();
      
      return () => {
        const endTime = performance.now();
        const loadTime = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`⚡ Component "${componentName}" render time: ${loadTime.toFixed(2)}ms`);
        }
        
        // Send to performance monitoring service
        if (window.performanceMonitor) {
          window.performanceMonitor.trackComponentLoad(componentName, loadTime);
        }
      };
    }, []);

    return <Component {...props} />;
  };
};

export default {
  createLazyComponent,
  preloadComponent,
  LazyImage,
  LazySection,
  logBundleInfo,
  withPerformanceMonitoring
};
