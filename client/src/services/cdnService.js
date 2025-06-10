/**
 * CDN Integration Service for AstraLearn
 * Part of Phase 3 Step 3: Production Optimization & Advanced Features
 * 
 * Provides static asset delivery optimization through:
 * - CDN-based asset serving
 * - Image optimization and compression
 * - Progressive image loading
 * - Asset caching strategies
 */

class CDNService {
  constructor() {
    this.cdnBaseUrl = import.meta.env.VITE_CDN_URL || '';
    this.imageOptimizationEnabled = import.meta.env.VITE_IMAGE_OPTIMIZATION === 'true';
    this.supportedFormats = ['webp', 'avif', 'jpg', 'png'];
    this.cacheDuration = 7 * 24 * 60 * 60 * 1000; // 7 days
    
    this.initializeService();
  }

  /**
   * Initialize CDN service
   */
  initializeService() {
    console.log('🌐 Initializing CDN Service...');
    
    // Check browser support for modern image formats
    this.checkFormatSupport();
    
    // Initialize lazy loading intersection observer
    this.initializeLazyLoading();
    
    console.log('✅ CDN Service initialized');
  }

  /**
   * Check browser support for modern image formats
   */
  async checkFormatSupport() {
    this.formatSupport = {
      webp: await this.supportsFormat('webp'),
      avif: await this.supportsFormat('avif')
    };
    
    console.log('🖼️ CDN: Format support:', this.formatSupport);
  }

  /**
   * Test if browser supports image format
   */
  supportsFormat(format) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      
      try {
        const dataURL = canvas.toDataURL(`image/${format}`);
        resolve(dataURL.indexOf(`data:image/${format}`) === 0);
      } catch (error) {
        resolve(false);
      }
    });
  }

  /**
   * Get optimized image URL
   */
  getOptimizedImageUrl(originalUrl, options = {}) {
    const {
      width,
      height,
      quality = 80,
      format = 'auto',
      fit = 'cover',
      blur,
      gravity = 'center'
    } = options;

    // If no CDN is configured, return original URL
    if (!this.cdnBaseUrl) {
      return originalUrl;
    }

    // Determine best format based on browser support
    let targetFormat = format;
    if (format === 'auto') {
      if (this.formatSupport.avif) {
        targetFormat = 'avif';
      } else if (this.formatSupport.webp) {
        targetFormat = 'webp';
      } else {
        targetFormat = 'jpg';
      }
    }

    // Build optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width);
    if (height) params.append('h', height);
    if (quality !== 80) params.append('q', quality);
    if (targetFormat !== 'auto') params.append('f', targetFormat);
    if (fit !== 'cover') params.append('fit', fit);
    if (blur) params.append('blur', blur);
    if (gravity !== 'center') params.append('g', gravity);

    // Encode original URL
    const encodedUrl = encodeURIComponent(originalUrl);
    
    return `${this.cdnBaseUrl}/image/${encodedUrl}?${params.toString()}`;
  }

  /**
   * Get responsive image srcset
   */
  getResponsiveSrcSet(originalUrl, options = {}) {
    const {
      sizes = [320, 640, 768, 1024, 1280, 1536],
      quality = 80,
      format = 'auto'
    } = options;

    if (!this.cdnBaseUrl) {
      return { src: originalUrl, srcSet: '' };
    }

    const srcSet = sizes
      .map(size => {
        const optimizedUrl = this.getOptimizedImageUrl(originalUrl, {
          width: size,
          quality,
          format
        });
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');

    const src = this.getOptimizedImageUrl(originalUrl, {
      width: sizes[Math.floor(sizes.length / 2)],
      quality,
      format
    });

    return { src, srcSet };
  }

  /**
   * Preload critical images
   */
  preloadImages(urls, options = {}) {
    const {
      priority = 'high',
      as = 'image',
      crossorigin = 'anonymous'
    } = options;

    urls.forEach(url => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = as;
      link.href = this.getOptimizedImageUrl(url, { width: 1200 });
      link.crossOrigin = crossorigin;
      link.setAttribute('fetchpriority', priority);
      
      document.head.appendChild(link);
    });

    console.log(`🚀 CDN: Preloaded ${urls.length} critical images`);
  }

  /**
   * Get static asset URL
   */
  getAssetUrl(path, options = {}) {
    const { 
      version = 'latest',
      cacheBust = false
    } = options;

    if (!this.cdnBaseUrl) {
      return path;
    }

    let url = `${this.cdnBaseUrl}/assets/${version}${path}`;
    
    if (cacheBust) {
      const timestamp = Date.now();
      url += (url.includes('?') ? '&' : '?') + `cb=${timestamp}`;
    }

    return url;
  }

  /**
   * Initialize lazy loading for images
   */
  initializeLazyLoading() {
    if ('IntersectionObserver' in window) {
      this.lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            this.loadImage(img);
            this.lazyImageObserver.unobserve(img);
          }
        });
      }, {
        rootMargin: '50px 0px',
        threshold: 0.01
      });
    }
  }

  /**
   * Register image for lazy loading
   */
  registerLazyImage(img, options = {}) {
    if (!this.lazyImageObserver) {
      // Fallback for browsers without IntersectionObserver
      this.loadImage(img, options);
      return;
    }

    // Store optimization options
    img.dataset.cdnOptions = JSON.stringify(options);
    
    // Add to observer
    this.lazyImageObserver.observe(img);
  }

  /**
   * Load and optimize image
   */
  loadImage(img, options = {}) {
    const storedOptions = img.dataset.cdnOptions 
      ? JSON.parse(img.dataset.cdnOptions) 
      : options;

    const originalSrc = img.dataset.src || img.src;
    
    if (storedOptions.responsive) {
      const { src, srcSet } = this.getResponsiveSrcSet(originalSrc, storedOptions);
      img.src = src;
      img.srcset = srcSet;
    } else {
      img.src = this.getOptimizedImageUrl(originalSrc, storedOptions);
    }

    img.classList.add('loaded');
  }

  /**
   * Purge CDN cache for specific assets
   */
  async purgeCache(urls) {
    if (!this.cdnBaseUrl) {
      console.warn('CDN: No CDN URL configured for cache purging');
      return false;
    }

    try {
      const response = await fetch(`${this.cdnBaseUrl}/purge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_CDN_API_KEY}`
        },
        body: JSON.stringify({ urls })
      });

      if (response.ok) {
        console.log(`🗑️ CDN: Purged cache for ${urls.length} URLs`);
        return true;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ CDN: Cache purge failed:', error);
      return false;
    }
  }

  /**
   * Get CDN analytics
   */
  async getAnalytics(timeRange = '24h') {
    if (!this.cdnBaseUrl) {
      return null;
    }

    try {
      const response = await fetch(
        `${this.cdnBaseUrl}/analytics?range=${timeRange}`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_CDN_API_KEY}`
          }
        }
      );

      if (response.ok) {
        const analytics = await response.json();
        console.log('📊 CDN Analytics:', analytics);
        return analytics;
      }
    } catch (error) {
      console.error('❌ CDN: Failed to fetch analytics:', error);
    }

    return null;
  }

  /**
   * Generate video poster frame
   */
  getVideoPoster(videoUrl, options = {}) {
    const {
      time = '00:00:01',
      width = 1280,
      height = 720,
      format = 'jpg'
    } = options;

    if (!this.cdnBaseUrl) {
      return null;
    }

    const params = new URLSearchParams({
      t: time,
      w: width,
      h: height,
      f: format
    });

    const encodedUrl = encodeURIComponent(videoUrl);
    return `${this.cdnBaseUrl}/video/${encodedUrl}/poster?${params.toString()}`;
  }

  /**
   * Get CDN performance metrics
   */
  getPerformanceMetrics() {
    const performance = {
      formatSupport: this.formatSupport,
      cdnEnabled: !!this.cdnBaseUrl,
      imageOptimization: this.imageOptimizationEnabled,
      lazyLoadingSupported: 'IntersectionObserver' in window,
      cacheStatus: this.getCacheStatus()
    };

    return performance;
  }

  /**
   * Get cache status from localStorage
   */
  getCacheStatus() {
    try {
      const cached = Object.keys(localStorage)
        .filter(key => key.startsWith('cdn_cache_'))
        .length;
      
      return {
        cachedItems: cached,
        cacheSize: this.estimateLocalStorageSize(),
        lastCleanup: localStorage.getItem('cdn_last_cleanup')
      };
    } catch (error) {
      return { error: 'Unable to access cache status' };
    }
  }

  /**
   * Estimate localStorage size
   */
  estimateLocalStorageSize() {
    let total = 0;
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
    } catch (error) {
      return 0;
    }
    return total;
  }

  /**
   * Clean up old cache entries
   */
  cleanupCache() {
    try {
      const now = Date.now();
      const keysToRemove = [];

      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cdn_cache_')) {
          try {
            const item = JSON.parse(localStorage.getItem(key));
            if (now - item.timestamp > this.cacheDuration) {
              keysToRemove.push(key);
            }
          } catch (error) {
            keysToRemove.push(key); // Remove corrupted entries
          }
        }
      });

      keysToRemove.forEach(key => localStorage.removeItem(key));
      localStorage.setItem('cdn_last_cleanup', now.toString());

      console.log(`🧹 CDN: Cleaned up ${keysToRemove.length} cache entries`);
      return keysToRemove.length;
    } catch (error) {
      console.error('❌ CDN: Cache cleanup failed:', error);
      return 0;
    }
  }
}

// Create singleton instance
const cdnService = new CDNService();

export default cdnService;
