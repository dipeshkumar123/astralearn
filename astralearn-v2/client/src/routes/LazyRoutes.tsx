import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { LazyRoutes } from '@/utils/performance';

// Error fallback component
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ 
  error, 
  resetErrorBoundary 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6 text-center">
      <div className="text-red-500 mb-4">
        <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-4">
        {error.message || 'An unexpected error occurred while loading this page.'}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 transition-colors"
      >
        Try again
      </button>
    </div>
  </div>
);

// Loading fallback component
const PageLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">Loading page...</p>
    </div>
  </div>
);

// Route wrapper with error boundary and suspense
const RouteWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <Suspense fallback={<PageLoadingFallback />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

// Main application routes with lazy loading
export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        <RouteWrapper>
          <LazyRoutes.Login />
        </RouteWrapper>
      } />
      <Route path="/register" element={
        <RouteWrapper>
          <LazyRoutes.Register />
        </RouteWrapper>
      } />

      {/* Protected routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      <Route path="/dashboard" element={
        <RouteWrapper>
          <LazyRoutes.EnhancedStudentDashboard />
        </RouteWrapper>
      } />

      {/* Course routes */}
      <Route path="/courses" element={
        <RouteWrapper>
          <LazyRoutes.Courses />
        </RouteWrapper>
      } />
      <Route path="/courses/:id" element={
        <RouteWrapper>
          <LazyRoutes.CourseDetail />
        </RouteWrapper>
      } />
      <Route path="/courses/:id/learn" element={
        <RouteWrapper>
          <LazyRoutes.LearningInterface />
        </RouteWrapper>
      } />
      <Route path="/my-courses" element={
        <RouteWrapper>
          <LazyRoutes.MyCourses />
        </RouteWrapper>
      } />

      {/* Instructor routes */}
      <Route path="/instructor/dashboard" element={
        <RouteWrapper>
          <LazyRoutes.InstructorDashboard />
        </RouteWrapper>
      } />
      <Route path="/instructor/courses/create" element={
        <RouteWrapper>
          <LazyRoutes.CourseEditor />
        </RouteWrapper>
      } />
      <Route path="/instructor/courses/:id/edit" element={
        <RouteWrapper>
          <LazyRoutes.CourseEditor />
        </RouteWrapper>
      } />

      {/* Analytics and recommendations */}
      <Route path="/analytics" element={
        <RouteWrapper>
          <LazyRoutes.LearningAnalytics />
        </RouteWrapper>
      } />
      <Route path="/recommendations" element={
        <RouteWrapper>
          <LazyRoutes.RecommendationsPage />
        </RouteWrapper>
      } />

      {/* Forum routes */}
      <Route path="/forum" element={
        <RouteWrapper>
          <LazyRoutes.DiscussionForums />
        </RouteWrapper>
      } />
      <Route path="/forum/posts/:postId" element={
        <RouteWrapper>
          <LazyRoutes.ForumPostDetail />
        </RouteWrapper>
      } />

      {/* Profile and settings */}
      <Route path="/profile" element={
        <RouteWrapper>
          <LazyRoutes.Profile />
        </RouteWrapper>
      } />
      <Route path="/settings" element={
        <RouteWrapper>
          <LazyRoutes.Settings />
        </RouteWrapper>
      } />

      {/* 404 route */}
      <Route path="*" element={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Page not found</h2>
            <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
            <a
              href="/dashboard"
              className="bg-primary-600 text-white px-6 py-3 rounded-md hover:bg-primary-700 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
};

// Route preloading for better performance
export class RoutePreloader {
  private static preloadedRoutes = new Set<string>();

  static preloadRoute(routeName: keyof typeof LazyRoutes) {
    if (this.preloadedRoutes.has(routeName)) return;

    // Preload the component
    const component = LazyRoutes[routeName];
    if (component) {
      // This will trigger the dynamic import
      component.preload?.();
      this.preloadedRoutes.add(routeName);
    }
  }

  static preloadCriticalRoutes() {
    // Preload routes that users are likely to visit
    const criticalRoutes: (keyof typeof LazyRoutes)[] = [
      'Dashboard',
      'Courses',
      'LearningInterface',
      'DiscussionForums'
    ];

    criticalRoutes.forEach(route => {
      setTimeout(() => this.preloadRoute(route), 100);
    });
  }

  static preloadOnHover(routeName: keyof typeof LazyRoutes) {
    return () => {
      this.preloadRoute(routeName);
    };
  }

  static preloadOnIdle(routeName: keyof typeof LazyRoutes) {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        this.preloadRoute(routeName);
      });
    } else {
      setTimeout(() => this.preloadRoute(routeName), 1000);
    }
  }
}

// Progressive Web App features
export class PWAManager {
  private static deferredPrompt: any = null;

  static init() {
    this.initServiceWorker();
    this.initInstallPrompt();
    this.initOfflineSupport();
  }

  private static initServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }

  private static initInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      
      // Show install button
      this.showInstallButton();
    });
  }

  private static showInstallButton() {
    const installButton = document.createElement('button');
    installButton.textContent = 'Install App';
    installButton.className = 'fixed bottom-4 left-4 bg-primary-600 text-white px-4 py-2 rounded-md shadow-lg z-50';
    installButton.onclick = () => this.promptInstall();
    
    document.body.appendChild(installButton);
  }

  static promptInstall() {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      
      this.deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        this.deferredPrompt = null;
      });
    }
  }

  private static initOfflineSupport() {
    window.addEventListener('online', () => {
      console.log('Back online');
      // Sync any pending data
    });

    window.addEventListener('offline', () => {
      console.log('Gone offline');
      // Show offline indicator
    });
  }
}

// Resource hints for better performance
export const addResourceHints = () => {
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'api.example.com'
  ];

  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = `//${domain}`;
    document.head.appendChild(link);
  });

  // Preconnect to critical origins
  const preconnectOrigins = [
    'https://fonts.googleapis.com',
    'https://api.example.com'
  ];

  preconnectOrigins.forEach(origin => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = origin;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Initialize all routing optimizations
export const initializeRoutingOptimizations = () => {
  // Add resource hints
  addResourceHints();
  
  // Preload critical routes
  RoutePreloader.preloadCriticalRoutes();
  
  // Initialize PWA features
  PWAManager.init();
  
  console.log('Routing optimizations initialized');
};
